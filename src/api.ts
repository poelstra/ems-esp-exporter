import axios, { AxiosInstance } from "axios";
import { DeviceType } from "./entities";
import { JsonValue, parseEnum } from "./util";

export interface Device {
    type: DeviceType; // TODO Is this indeed the same type?
    name: string;
    deviceId: number;
    productId: number;
    version: string;
    entities: number;
}

export interface System {
    devices: Device[];
}

interface RawSystem {
    // TODO Add other entries as needed
    Devices: RawDevice[];
}

interface RawDevice {
    type: string;
    name: string;
    "device id": string;
    "product id": number;
    version: string;
    entities: number;
}

export type RawValues = Record<string, JsonValue>;

export class Api {
    public readonly api: AxiosInstance;
    public system!: System;

    public static async create(host: string): Promise<Api> {
        const api = new Api(host);
        await api.init();
        return api;
    }

    private constructor(host: string) {
        this.api = axios.create({
            baseURL: `${host}/api`,
        });
    }

    public async init(): Promise<void> {
        await this.getSystem();
    }

    public async getSystem(): Promise<System> {
        const rawSystem = await this.get<RawSystem>("/system");
        const system = parseSystem(rawSystem);
        this.system = system;
        return system;
    }

    public async get<T>(path: string): Promise<T> {
        return (await this.api.get(path)).data;
    }

    public async getRawValues(device: DeviceType): Promise<RawValues> {
        return this.get<RawValues>(`/${device}/values`);
    }
}

function parseSystem(raw: RawSystem): System {
    return {
        devices: parseDevices(raw.Devices),
    };
}

function parseDevices(raw: RawDevice[]): Device[] {
    return raw.map((dev) => ({
        type: parseEnum(dev.type.toLowerCase(), DeviceType, "DeviceType"),
        name: dev.name,
        deviceId: parseInt(dev["device id"]), // given as e.g. 0x08
        productId: dev["product id"],
        version: dev.version,
        entities: dev.entities,
    }));
}
