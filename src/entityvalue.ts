import { Value, ValueType } from "./common";
import { parseEnum } from "./util";

export interface RawEntityValues {
    [key: string]: RawEntityValue;
}

export enum StateClass {
    Measurement = "measurement",
    TotalIncreasing = "total_increasing",
}

export type DeviceClass = string; // TODO
// export enum DeviceClass {
// }

export interface RawEntityValue {
    name: string;
    fullname: string;
    circuit: string;
    type: string;
    readable: boolean;
    writeable: boolean;
    visible: boolean;
    state_class?: StateClass;
    device_class?: DeviceClass;
    uom?: string;
    min?: number;
    max?: number;
    bool?: boolean;
    index?: number; // Index in `enum` for enums, 0 for false, 1 for true for booleans
    value?: number | string; // "off" and "on" for booleans, enum literal text for enums
    enum?: string[];
}

export function parseEntityValues(rawEntityValues: RawEntityValues): Value[] {
    return Object.values(rawEntityValues).map(parseEntityValue);
}

export function parseEntityValue(raw: RawEntityValue): Value {
    // As a heuristic, we assume that large numbers (i.e. larger than uint16) are counters,
    // which seems to be the case in all entities in dump_entities.csv so far.
    const isCounter =
        raw.type === ValueType.Number &&
        (raw.state_class === StateClass.TotalIncreasing ||
            (raw.state_class === undefined &&
                raw.max !== undefined &&
                raw.max > 0xffff));

    let value;
    if (raw.value !== undefined) {
        switch (raw.type) {
            case ValueType.Number:
                value =
                    typeof raw.value === "number"
                        ? raw.value
                        : parseFloat(String(raw.value));
                break;
            case ValueType.Boolean:
                // Index will exist if value is defined, but
                // value is a localized string, so use index
                // instead (0 = false, 1 = true).
                value = !!raw.index;
                break;
            case ValueType.Enum:
                value = raw.value;
                break;
            case ValueType.String:
                value = raw.value;
                break;
            case ValueType.Command:
                // Set-only value, ignore
                break;
            default:
                // In case new values are added to the enumerations
                throw new Error(`Unknown entity type ${raw.type}`);
        }
    }
    return {
        entity: {
            shortName: raw.name,
            fullName: raw.fullname,
            type: parseEnum(raw.type, ValueType, "ValueType"),
            literals: raw.enum,
            unit: raw.uom,
            counter: isCounter,
            writable: raw.writeable,
            min: raw.min,
            max: raw.max,
            // TODO Add other fields from RawEntityValue?
        },
        shortName: !!raw.circuit ? `${raw.circuit}.${raw.name}` : raw.name,
        value,
    };
}
