import { JsonValue } from "./util";

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
    TemperatureSensor = "temperaturesensor",
    AnalogSensor = "analogsensor",
    Generic = "generic",
}

export enum ValueType {
    Boolean = "boolean",
    Enum = "enum",
    Number = "number",
    String = "string",
    Command = "command",
}

export interface Value {
    shortName: string;
    value?: JsonValue;
    entity?: Entity;
}

export interface Entity {
    shortName: string;
    fullName: string;
    type: ValueType;
    literals?: string[]; // in case type == ValueType.Enum
    unit?: string;
    min?: number;
    max?: number;
    counter?: boolean; // Whether (numeric) value is a monotonically increasing value
    writable: boolean;
}
