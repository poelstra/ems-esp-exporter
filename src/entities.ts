import { parse } from "csv-parse/sync";
import { readFile } from "fs/promises";
import { RawValues } from "./api";
import { DeviceType, Entity, Value, ValueType } from "./common";
import { parseEnum, warnOnce } from "./util";

export enum RawValueType {
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

export interface FullEntity extends Entity {
    deviceName: string;
    deviceType: DeviceType;
    productId: number;
    discoveryEntityIdOld: string; // Until version 3.4
    discoveryEntityId: string;
}

interface RawCsvEntity {
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

function rawValueTypeToValueType(raw: RawValueType): ValueType {
    switch (raw) {
        case RawValueType.Boolean:
            return ValueType.Boolean;
        case RawValueType.Enum:
            return ValueType.Enum;
        case RawValueType.String:
            return ValueType.String;
        case RawValueType.Command:
            return ValueType.Command;
        default:
            return ValueType.Number;
    }
}

function rawEntityToEntity(raw: RawCsvEntity): FullEntity {
    const deviceType = parseEnum(raw.deviceType, DeviceType, "DeviceType");
    const typeElements = raw.type.split(" ");
    const rawType = parseEnum(
        remapOldValueType(typeElements[0]),
        RawValueType,
        "ValueType",
    );
    const trimmedUnit = raw.unit.trim();
    const unit = trimmedUnit !== "" ? trimmedUnit : undefined;
    const result: FullEntity = {
        deviceName: raw.deviceName,
        deviceType,
        productId: parseInt(raw.productId, 10),
        shortName: raw.shortName,
        fullName: raw.fullName,
        type: rawValueTypeToValueType(rawType),
        unit,
        writable: raw.writable === "true",
        discoveryEntityIdOld: raw.discoveryEntityIdOld,
        discoveryEntityId: raw.discoveryEntityId,
    };

    if (rawType === RawValueType.Enum) {
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
    if (
        rawType === RawValueType.Time ||
        rawType === RawValueType.UInt24 ||
        rawType === RawValueType.UInt32
    ) {
        result.counter = true;
    }

    return result;
}

const CSV_COLUMN_MAPPING: Record<string, keyof RawCsvEntity> = {
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

const OLD_VALUE_TYPE_MAPPING: Record<string, RawValueType> = {
    int: RawValueType.Int8,
    uint: RawValueType.UInt8,
    short: RawValueType.Int16,
    ushort: RawValueType.UInt16,
    ulong: RawValueType.UInt32,
};

/**
 * Parse entity definitions from dump_entities.csv file.
 */
export async function readEntities(filename: string): Promise<FullEntity[]> {
    const entitiesText = await readFile(filename, "utf8");
    const rawEntities: RawCsvEntity[] = parse(entitiesText, {
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
    private _entities: Map<number, Map<string, FullEntity>> = new Map();

    constructor(entities: FullEntity[]) {
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
        entity: FullEntity,
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
