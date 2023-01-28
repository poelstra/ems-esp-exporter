import { parse } from "csv-parse/sync";
import { readFile } from "fs/promises";
import { RawValues } from "./api";
import { JsonValue, parseEnum, warnOnce } from "./util";

export enum DeviceType {
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
}

export enum ValueType {
    UShort = "ushort",
    Command = "cmd",
    Boolean = "boolean",
    UInt = "uint",
    Short = "short",
    Int = "int",
    ULong = "ulong",
    Time = "time",
    String = "string",
    Enum = "enum",
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
    discoveryEntityIdOld: string;
    discoveryEntityId: string;
}

function rawEntityToEntity(raw: RawEntity): Entity {
    const deviceType = parseEnum(raw.deviceType, DeviceType, "DeviceType");
    const typeElements = raw.type.split(" ");
    const type = parseEnum(typeElements[0], ValueType, "ValueType");
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
        const matches = raw.type.match(/^enum \[(.*)\]$/);
        if (!matches) {
            throw new Error(
                `error parsing ${raw.shortName}, missing enum literals`
            );
        }
        result.literals = matches[1].split("\\|");
    }

    // Heuristically determine whether value is an absolute counter
    // Holds true for everything mentioned in dump_entities.csv of 20230128
    if (type === ValueType.Time || type === ValueType.ULong) {
        result.counter = true;
    }

    return result;
}

export async function readEntities(filename: string): Promise<Entity[]> {
    const entitiesText = await readFile(filename, "utf8");
    const rawEntities: RawEntity[] = parse(entitiesText, {
        columns: [
            "deviceName",
            "deviceType",
            "productId",
            "shortName",
            "fullName",
            "type", // [options...] \| (min/max)
            "unit",
            "writable",
            "discoveryEntityIdOld",
            "discoveryEntityId",
        ],
        fromLine: 2, // skip header
        autoParse: true,
    });
    //console.log(entities);

    return rawEntities.map(rawEntityToEntity);
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
        return Array.from(Object.entries(rawValues)).map(([key, value]) => {
            const entity = prodEntities?.get(key);
            if (prodEntities && !entity) {
                warnOnce(
                    `Unknown entity ${key} for product model id ${productModelId}`
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
                                `Enum index ${value} out of range for ${key} in product model id ${productModelId}, expected 0..${
                                    literals.length - 1
                                }`
                            );
                        }
                        value = literal;
                    } else {
                        const enumIdx = literals.indexOf(String(value));
                        if (enumIdx < 0) {
                            warnOnce(
                                `Unknown or invalid enum value ${value} for ${key} in product model id ${productModelId}, expected one of ${literals.join(
                                    ", "
                                )}`
                            );
                        }
                    }
                }
            }
            return {
                shortName: key,
                value,
                entity,
            };
        });
    }

    private _add(
        productModelId: number,
        shortName: string,
        entity: Entity
    ): void {
        let ents = this._entities.get(productModelId);
        if (!ents) {
            ents = new Map();
            this._entities.set(productModelId, ents);
        }
        ents.set(shortName, entity);
    }
}
