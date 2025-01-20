import { parse } from "csv-parse/sync";
import { readFile } from "fs/promises";
import { RawValues } from "./api";
import { JsonValue, parseEnum, warnOnce } from "./util";

export enum DeviceType {
    System = "system",
    Boiler = "boiler",
    Thermostat = "thermostat",
    Heatpump = "heatpump",
    Heatsource = "heatsource",
    Solar = "solar",
    Connect = "connect",
    Mixer = "mixer",
    Controller = "controller",
    Switch = "switch",
    Gateway = "gateway",
    Alert = "alert",
    Pump = "pump",
    Extension = "extension",
    Ventilation = "ventilation",
    Water = "water",
    Pool = "pool",
}

export enum ValueType {
    Boolean = "boolean",
    Int8 = "int8",
    UInt8 = "uint8",
    Int16 = "int16",
    UInt16 = "uint16",
    UInt24 = "uint24",
    Time = "time",
    UInt32 = "uint32",
    Enum = "enum",
    String = "string",
    Command = "cmd",
}

export interface Value {
    shortName: string;
    value: JsonValue;
    entity?: Entity;
}

export interface Entity {
    deviceName: string;
    deviceType: DeviceType;
    productId: number;
    shortName: string;
    fullName: string;
    type: ValueType;
    literals?: string[]; // in case type == ValueType.Enum
    unit?: string;
    counter?: boolean; // Whether (numeric) value is a monotonically increasing value
    writable: boolean;
    discoveryEntityIdOld: string;
    discoveryEntityId: string;
}

interface RawEntity {
    deviceName: string;
    deviceType: string;
    productId: string;
    shortName: string;
    fullName: string;
    type: string;
    unit: string;
    writable: string;
    discoveryEntityIdOld: string; // Until version 3.4
    discoveryEntityId: string;
    modbusUnitId?: number;
    modbusBlock?: number;
    modbusScaleFactor?: string; // e.g. "1/100"
    modbusOffset?: number;
    modbusCount?: number;
}

function rawEntityToEntity(raw: RawEntity): Entity {
    const deviceType = parseEnum(raw.deviceType, DeviceType, "DeviceType");
    const typeElements = raw.type.split(" ");
    const type = parseEnum(
        remapOldValueType(typeElements[0]),
        ValueType,
        "ValueType",
    );
    const trimmedUnit = raw.unit.trim();
    const unit = trimmedUnit !== "" ? trimmedUnit : undefined;
    const result: Entity = {
        deviceName: raw.deviceName,
        deviceType,
        productId: parseInt(raw.productId, 10),
        shortName: raw.shortName,
        fullName: raw.fullName,
        type,
        unit,
        writable: raw.writable === "true",
        discoveryEntityIdOld: raw.discoveryEntityIdOld,
        discoveryEntityId: raw.discoveryEntityId,
    };

    if (type === ValueType.Enum) {
        // Parse "selTemp" and "roomTemp" out of a string like "enum [selTemp\|roomTemp] (>=5<=30)",
        // where the " (>=5<=30)" piece only seems to exist for "haclimate".
        const matches = raw.type.match(/^enum \[(.*)\]( \([^\)]+\))?$/);
        if (!matches) {
            throw new Error(
                `error parsing ${raw.shortName}, missing enum literals`,
            );
        }
        result.literals = matches[1].split("\\|");
    }

    // Heuristically determine whether value is an absolute counter
    // Holds true for everything mentioned in dump_entities.csv of 20230128
    if (type === ValueType.Time || type === ValueType.UInt32) {
        result.counter = true;
    }

    return result;
}

const CSV_COLUMN_MAPPING: Record<string, keyof RawEntity> = {
    "device name": "deviceName",
    "device type": "deviceType",
    "product id": "productId",
    shortname: "shortName",
    fullname: "fullName",
    "type [options...] \\| (min/max)": "type",
    uom: "unit",
    writeable: "writable",
    "discovery entityid v3.4": "discoveryEntityIdOld",
    "discovery entityid": "discoveryEntityId",
    " discovery entityid": "discoveryEntityId",
    "modbus unit identifier": "modbusUnitId",
    "modbus block": "modbusBlock",
    "modbus scale factor": "modbusScaleFactor",
    "modbus offset": "modbusOffset",
    "modbus count": "modbusCount",
};

const OLD_VALUE_TYPE_MAPPING: Record<string, ValueType> = {
    int: ValueType.Int8,
    uint: ValueType.UInt8,
    short: ValueType.Int16,
    ushort: ValueType.UInt16,
    ulong: ValueType.UInt32,
};

export async function readEntities(filename: string): Promise<Entity[]> {
    const entitiesText = await readFile(filename, "utf8");
    const rawEntities: RawEntity[] = parse(entitiesText, {
        columns: (names: string[]) => names.map(remapColumnName),
        cast: true,
    });

    return rawEntities.map(rawEntityToEntity);
}

function remapColumnName(columnName: string): string {
    return CSV_COLUMN_MAPPING[columnName] ?? columnName;
}

function remapOldValueType(valueType: string): string {
    return OLD_VALUE_TYPE_MAPPING[valueType] ?? valueType;
}

export class Entities {
    /**
     * Map (productModelId, shortName) to Entity
     */
    private _entities: Map<number, Map<string, Entity>> = new Map();

    constructor(entities: Entity[]) {
        for (const ent of entities) {
            this._add(ent.productId, ent.shortName, ent);
        }
    }

    public parseValues(productModelId: number, rawValues: RawValues): Value[] {
        const prodEntities = this._entities.get(productModelId);
        if (!prodEntities) {
            warnOnce(`Unknown product model id ${productModelId}`);
        }
        return this._parseProductValues(
            rawValues,
            prodEntities,
            productModelId,
            [],
        );
    }

    private _parseProductValues(
        rawValues: RawValues,
        prodEntities: Map<string, Entity> | undefined,
        productModelId: number,
        path: string[],
    ): Value[] {
        return Array.from(Object.entries(rawValues)).flatMap(([key, value]) => {
            // Values can be namespaced, like `dhw.3wayvalve`, but historically, they were not like that
            // in dump_entities.csv. So try to look up using both. If path is empty, it will just be the key.
            const fullKey = [...path, key].join(".");
            const entity = prodEntities?.get(fullKey) ?? prodEntities?.get(key);

            if (!entity && !!value && typeof value === "object") {
                // The value is a 'namespaced' object, like `dhw`.
                return this._parseProductValues(
                    value as RawValues,
                    prodEntities,
                    productModelId,
                    [...path, key],
                );
            }

            if (prodEntities && !entity) {
                warnOnce(
                    `Unknown entity ${key} for product model id ${productModelId}`,
                );
            }
            if (entity) {
                if (entity.type === ValueType.Boolean) {
                    switch (String(value).toLowerCase()) {
                        case "true":
                        case "on":
                        case "1":
                            value = true;
                            break;
                        default:
                            value = false;
                    }
                } else if (entity.type === ValueType.Enum) {
                    const literals = entity.literals ?? [];
                    if (typeof value === "number") {
                        const literal = literals[value];
                        if (!literal) {
                            warnOnce(
                                `Enum index ${value} out of range for ${key} in product model id ${productModelId}, expected 0..${literals.length - 1}`,
                            );
                        }
                        value = literal;
                    } else {
                        const enumIdx = literals.indexOf(String(value));
                        if (enumIdx < 0) {
                            warnOnce(
                                `Unknown or invalid enum value ${value} for ${key} in product model id ${productModelId}, expected one of ${literals.join(
                                    ", ",
                                )}`,
                            );
                        }
                    }
                }
            }
            return {
                shortName: fullKey,
                value,
                entity,
            };
        });
    }

    private _add(
        productModelId: number,
        shortName: string,
        entity: Entity,
    ): void {
        let ents = this._entities.get(productModelId);
        if (!ents) {
            ents = new Map();
            this._entities.set(productModelId, ents);
        }
        // This check is disabled, as it gives too many hits due to issues with the
        // CSV file (the duplicates are indeed duplicates as far as I can see).
        // if (ents.has(shortName)) {
        //     warnOnce(
        //         `Duplicate shortname ${shortName} for product model id ${productModelId}`,
        //     );
        // }
        ents.set(shortName, entity);
    }
}
