import axios, { AxiosInstance } from "axios";
import { DeviceType } from "./entities";
import { JsonValue, parseEnum } from "./util";

export interface Device {
    type: DeviceType; // e.g. 'boiler' // TODO Is this indeed the same type?
    name: string; // 'Topline/GB162'
    deviceId: number; // e.g. 8
    productId: number; // e.g. 115
    version: string; // e.g. '03.06'
    entities: number; // e.g. 68
    handlersReceived?: number[]; // e.g. [0x10, 0x11, 0x15, 0x1C, 0x18, 0x19, 0x34]
    handlersFetched?: number[]; // e.g. [0x14, 0x16, 0x33]
    handlersPending?: number[]; // e.g. [0xBF, 0xC2, 0x1A, 0x35, 0x26, 0x2A, 0xD1, 0xE3, 0xE4, 0xE5, 0xE6, 0xE9, 0xEA]
    handlersIgnored?: number[];
}

export enum ConnectionStatus {
    Connected = "connected",
    Disconnected = "disconnected",
}

export enum ApProvisionMode {
    "Always" = "always",
    "Disconnected" = "disconnected",
    "Never" = "never",
}

export enum ApSecurity {
    Wpa2 = "wpa2",
    Open = "open",
}

export enum BusStatus {
    Unknown = "unknown",
    Disconnected = "disconnected",
    ConnectedWithIssues = "connected, tx issues - try a different Tx Mode",
    Connected = "connected",
}

export interface System {
    systemInfo: {
        version: string; // e.g. '3.5.1-dev.0'
        platform: string; // e.g. 'ESP32'
        uptimeSeconds: number; // e.g. 3175
        memFreeKb: number; // e.g. 121
        memMaxAllocKb: number; // e.g. 73
        appFreeKb: number; // e.g. 6152
        // resetReasonCore0: ResetReason;
        // resetReasonCore1: ResetReason;
    };
    networkInfo: {
        network: string; // e.g. 'WiFi'
        hostname: string; // e.g. 'ems-esp'
        RSSI: number; // e.g. -53
        ipv4Address: string; // e.g. '192.168.3.10/255.255.255.0'
        ipv4Gateway: string; // e.g. '192.168.3.1'
        ipv4Nameserver: string; // e.g. '192.168.3.1'
        staticIpConfig: boolean;
        enableIpv6: boolean;
        lowBandwidth: boolean;
        disableSleep: boolean;
        enableMdns: boolean;
        enableCors: boolean;
        corsOrigin?: string;
        ApProvisionMode: ApProvisionMode; // e.g. 'disconnected'
        ApSecurity: ApSecurity; // e.g. 'wpa2'
        ApSsid: string; // e.g. 'ems-esp'
    };
    ntpInfo: {
        status: ConnectionStatus; // e.g. 'connected'
        enabled: boolean;
        server: string; // e.g. 'nl.pool.ntp.org'
        tzLabel: string; // e.g. 'Europe/Amsterdam'
    };
    otaInfo: {
        enabled: boolean;
        port: number; // e.g. 8266
    };
    mqttInfo: {
        status: ConnectionStatus; // e.g. 'disconnected'
        enabled: boolean;
        clientId: string; // e.g. 'ems-esp'
        keepAlive: number; // e.g. 60
        cleanSession: boolean;
        entityFormat: number; // e.g. 0
        base: string; // e.g. 'ems-esp'
        discoveryPrefix: string; // e.g. 'homeassistant'
        nestedFormat: number; // e.g. 1
        haEnabled: boolean;
        mqttQos: number; // e.g. 0
        mqttRetain: boolean;
        publishTimeHeartbeat: number; // e.g. 60
        publishTimeBoiler: number; // e.g. 10
        publishTimeThermostat: number; // e.g. 10
        publishTimeSolar: number; // e.g. 10
        publishTimeMixer: number; // e.g. 10
        publishTimeOther: number; // e.g. 10
        publishTimeSensor: number; // e.g. 10
        publishSingle: boolean;
        publish2command: boolean;
        sendResponse: boolean;
    };
    syslogInfo: { enabled: boolean };
    sensorInfo: {
        temperatureSensors: number; // e.g. 0
        temperatureSensorReads: number; // e.g. 0
        temperatureSensorFails: number; // e.g. 0
        analogSensors: number; // e.g. 0
        analogSensorReads: number; // e.g. 0
        analogSensorFails: number; // e.g. 0
    };
    apiInfo: {
        apiCalls: number; // e.g. 383
        apiFails: number; // e.g. 1
    };
    busInfo: {
        status: BusStatus; // e.g. 'connected'
        protocol: string; // e.g. 'Buderus'
        rxTelegramsReceived: number; // e.g. 1344
        txReads: number; // e.g. 199
        txWrites: number; // e.g. 44
        incompleteTelegrams: number; // e.g. 0
        readsFailed: number; // e.g. 0
        writesFailed: number; // e.g. 0
        rxLineQuality: number; // e.g. 100
        txLineQuality: number; // e.g. 100
    };
    settings: {
        boardProfile: string; // e.g. 'S32'
        locale: string; // e.g. 'en'
        txMode: number; // e.g. 1
        emsBusId: number; // e.g. 11
        showerTimer: boolean;
        showerAlert: boolean;
        hideLed: boolean;
        notokenApi: boolean;
        readonlyMode: boolean;
        fahrenheit: boolean;
        dallasParasite: boolean;
        boolFormat: number; // e.g. 1
        boolDashboard: number; // e.g. 1
        enumFormat: number; // e.g. 1
        analogEnabled: boolean;
        telnetEnabled: boolean;
        maxWebLogBuffer: number; // e.g. 50
        webLogBuffer: number; // e.g. 50
    };
    devices: Device[];
}

interface RawSystem {
    "System Info": {
        version: string; // e.g. '3.5.1-dev.0'
        platform: string; // e.g. 'ESP32'
        uptime: string; // e.g. '000+00:52:55.063'
        "uptime (seconds)": number; // e.g. 3175
        "free mem": number; // e.g. 121
        "max alloc": number; // e.g. 73
        "free app": number; // e.g. 6152
        "reset reason": string; // e.g. 'Software reset CPU / Software reset CPU'
    };
    "Network Info": {
        network: string; // e.g. 'WiFi'
        hostname: string; // e.g. 'ems-esp'
        RSSI: number; // e.g. -53
        "IPv4 address": string; // e.g. '192.168.3.10/255.255.255.0'
        "IPv4 gateway": string; // e.g. '192.168.3.1'
        "IPv4 nameserver": string; // e.g. '192.168.3.1'
        "static ip config": boolean;
        "enable IPv6": boolean;
        "low bandwidth": boolean;
        "disable sleep": boolean;
        "enable MDNS": boolean;
        "enable CORS": boolean;
        "CORS origin": string;
        "AP provision mode": string; // e.g. 'disconnected'
        "AP security": string; // e.g. 'wpa2'
        "AP ssid": string; // e.g. 'ems-esp'
    };
    "NTP Info": {
        "NTP status": string; // e.g. 'connected'
        enabled: boolean;
        server: string; // e.g. 'nl.pool.ntp.org'
        "tz label": string; // e.g. 'Europe/Amsterdam'
    };
    "OTA Info": {
        enabled: boolean;
        port: number; // e.g. 8266
    };
    "MQTT Info": {
        "MQTT status": string; // e.g. 'disconnected'
        enabled: boolean;
        "client id": string; // e.g. 'ems-esp'
        "keep alive": number; // e.g. 60
        "clean session": boolean;
        "entity format": number; // e.g. 0
        base: string; // e.g. 'ems-esp'
        "discovery prefix": string; // e.g. 'homeassistant'
        "nested format": number; // e.g. 1
        "ha enabled": boolean;
        "mqtt qos": number; // e.g. 0
        "mqtt retain": boolean;
        "publish time heartbeat": number; // e.g. 60
        "publish time boiler": number; // e.g. 10
        "publish time thermostat": number; // e.g. 10
        "publish time solar": number; // e.g. 10
        "publish time mixer": number; // e.g. 10
        "publish time other": number; // e.g. 10
        "publish time sensor": number; // e.g. 10
        "publish single": boolean;
        publish2command: boolean;
        "send response": boolean;
    };
    "Syslog Info": { enabled: boolean };
    "Sensor Info": {
        "temperature sensors": number; // e.g. 0
        "temperature sensor reads": number; // e.g. 0
        "temperature sensor fails": number; // e.g. 0
        "analog sensors": number; // e.g. 0
        "analog sensor reads": number; // e.g. 0
        "analog sensor fails": number; // e.g. 0
    };
    "API Info": {
        "API calls": number; // e.g. 383,
        "API fails": number; // e.g. 1
    };
    "Bus Info": {
        "bus status": string; // e.g. 'connected'
        "bus protocol": string; // e.g. 'Buderus'
        "bus telegrams received (rx)": number; // e.g. 1344
        "bus reads (tx)": number; // e.g. 199
        "bus writes (tx)": number; // e.g. 44
        "bus incomplete telegrams": number; // e.g. 0
        "bus reads failed": number; // e.g. 0
        "bus writes failed": number; // e.g. 0
        "bus rx line quality": number; // e.g. 100
        "bus tx line quality": number; // e.g. 100
    };
    Settings: {
        "board profile": string; // e.g. 'S32'
        locale: string; // e.g. 'en'
        "tx mode": number; // e.g. 1
        "ems bus id": number; // e.g. 11
        "shower timer": boolean;
        "shower alert": boolean;
        "hide led": boolean;
        "notoken api": boolean;
        "readonly mode": boolean;
        fahrenheit: boolean;
        "dallas parasite": boolean;
        "bool format": number; // e.g. 1
        "bool dashboard": number; // e.g. 1
        "enum format": number; // e.g. 1
        "analog enabled": boolean;
        "telnet enabled": boolean;
        "max web log buffer": number; // e.g. 50
        "web log buffer": number; // e.g. 50
    };
    Devices: RawDevice[];
}

interface RawDevice {
    type: string; // e.g. 'boiler'
    name: string; // e.g. 'Topline/GB162'
    "device id": string; // e.g. '0x08'
    "product id": number; // e.g. 115
    version: string; // e.g. '03.06'
    entities: number; // e.g. 68
    "handlers received"?: string; // e.g. '0x10 0x11 0x15 0x1C 0x18 0x19 0x34'
    "handlers fetched"?: string; // e.g. '0x14 0x16 0x33'
    "handlers pending"?: string; // e.g. '0xBF 0xC2 0x1A 0x35 0x26 0x2A 0xD1 0xE3 0xE4 0xE5 0xE6 0xE9 0xEA'
    "handlers ignored"?: string;
}

export type RawValues = Record<string, JsonValue>;

export class Api {
    public readonly api: AxiosInstance;

    public constructor(host: string) {
        this.api = axios.create({
            baseURL: `${host}/api`,
        });
    }

    public async getSystem(): Promise<System> {
        const rawSystem = await this.get<RawSystem>("/system");
        const system = parseSystem(rawSystem);
        return system;
    }

    public async get<T>(path: string): Promise<T> {
        return (await this.api.get(path)).data;
    }

    public async getRawValues(device: DeviceType): Promise<RawValues> {
        return this.get<RawValues>(`/${device}/values`);
    }
}

export function parseSystem(raw: RawSystem): System {
    return {
        systemInfo: {
            version: raw["System Info"].version,
            platform: raw["System Info"].platform,
            uptimeSeconds: raw["System Info"]["uptime (seconds)"],
            memFreeKb: raw["System Info"]["free mem"],
            memMaxAllocKb: raw["System Info"]["max alloc"],
            appFreeKb: raw["System Info"]["free app"],
            // resetReasonCore0: ResetReason;
            // resetReasonCore1: ResetReason;
        },
        networkInfo: {
            network: raw["Network Info"].network,
            hostname: raw["Network Info"].hostname,
            RSSI: raw["Network Info"].RSSI,
            ipv4Address: raw["Network Info"]["IPv4 address"],
            ipv4Gateway: raw["Network Info"]["IPv4 gateway"],
            ipv4Nameserver: raw["Network Info"]["IPv4 nameserver"],
            staticIpConfig: raw["Network Info"]["static ip config"],
            enableIpv6: raw["Network Info"]["enable IPv6"],
            lowBandwidth: raw["Network Info"]["low bandwidth"],
            disableSleep: raw["Network Info"]["disable sleep"],
            enableMdns: raw["Network Info"]["enable MDNS"],
            enableCors: raw["Network Info"]["enable CORS"],
            corsOrigin: raw["Network Info"]["CORS origin"],
            ApProvisionMode: raw["Network Info"][
                "AP provision mode"
            ] as ApProvisionMode,
            ApSecurity: raw["Network Info"]["AP security"] as ApSecurity,
            ApSsid: raw["Network Info"]["AP ssid"],
        },
        ntpInfo: {
            status: raw["NTP Info"]["NTP status"] as ConnectionStatus,
            enabled: raw["NTP Info"]["enabled"],
            server: raw["NTP Info"]["server"],
            tzLabel: raw["NTP Info"]["tz label"],
        },
        otaInfo: {
            enabled: raw["OTA Info"].enabled,
            port: raw["OTA Info"].port,
        },
        mqttInfo: {
            status: raw["MQTT Info"]["MQTT status"] as ConnectionStatus,
            enabled: raw["MQTT Info"]["enabled"],
            clientId: raw["MQTT Info"]["client id"],
            keepAlive: raw["MQTT Info"]["keep alive"],
            cleanSession: raw["MQTT Info"]["clean session"],
            entityFormat: raw["MQTT Info"]["entity format"],
            base: raw["MQTT Info"]["base"],
            discoveryPrefix: raw["MQTT Info"]["discovery prefix"],
            nestedFormat: raw["MQTT Info"]["nested format"],
            haEnabled: raw["MQTT Info"]["ha enabled"],
            mqttQos: raw["MQTT Info"]["mqtt qos"],
            mqttRetain: raw["MQTT Info"]["mqtt retain"],
            publishTimeHeartbeat: raw["MQTT Info"]["publish time heartbeat"],
            publishTimeBoiler: raw["MQTT Info"]["publish time boiler"],
            publishTimeThermostat: raw["MQTT Info"]["publish time thermostat"],
            publishTimeSolar: raw["MQTT Info"]["publish time solar"],
            publishTimeMixer: raw["MQTT Info"]["publish time mixer"],
            publishTimeOther: raw["MQTT Info"]["publish time other"],
            publishTimeSensor: raw["MQTT Info"]["publish time sensor"],
            publishSingle: raw["MQTT Info"]["publish single"],
            publish2command: raw["MQTT Info"]["publish2command"],
            sendResponse: raw["MQTT Info"]["send response"],
        },
        syslogInfo: { enabled: raw["Syslog Info"].enabled },
        sensorInfo: {
            temperatureSensors: raw["Sensor Info"]["temperature sensors"],
            temperatureSensorReads:
                raw["Sensor Info"]["temperature sensor reads"],
            temperatureSensorFails:
                raw["Sensor Info"]["temperature sensor fails"],
            analogSensors: raw["Sensor Info"]["analog sensors"],
            analogSensorReads: raw["Sensor Info"]["analog sensor reads"],
            analogSensorFails: raw["Sensor Info"]["analog sensor fails"],
        },
        apiInfo: {
            apiCalls: raw["API Info"]["API calls"],
            apiFails: raw["API Info"]["API fails"],
        },
        busInfo: {
            status: raw["Bus Info"]["bus status"] as BusStatus,
            protocol: raw["Bus Info"]["bus protocol"],
            rxTelegramsReceived: raw["Bus Info"]["bus telegrams received (rx)"],
            txReads: raw["Bus Info"]["bus reads (tx)"],
            txWrites: raw["Bus Info"]["bus writes (tx)"],
            incompleteTelegrams: raw["Bus Info"]["bus incomplete telegrams"],
            readsFailed: raw["Bus Info"]["bus reads failed"],
            writesFailed: raw["Bus Info"]["bus writes failed"],
            rxLineQuality: raw["Bus Info"]["bus rx line quality"],
            txLineQuality: raw["Bus Info"]["bus tx line quality"],
        },
        settings: {
            boardProfile: raw["Settings"]["board profile"],
            locale: raw["Settings"]["locale"],
            txMode: raw["Settings"]["tx mode"],
            emsBusId: raw["Settings"]["ems bus id"],
            showerTimer: raw["Settings"]["shower timer"],
            showerAlert: raw["Settings"]["shower alert"],
            hideLed: raw["Settings"]["hide led"],
            notokenApi: raw["Settings"]["notoken api"],
            readonlyMode: raw["Settings"]["readonly mode"],
            fahrenheit: raw["Settings"]["fahrenheit"],
            dallasParasite: raw["Settings"]["dallas parasite"],
            boolFormat: raw["Settings"]["bool format"],
            boolDashboard: raw["Settings"]["bool dashboard"],
            enumFormat: raw["Settings"]["enum format"],
            analogEnabled: raw["Settings"]["analog enabled"],
            telnetEnabled: raw["Settings"]["telnet enabled"],
            maxWebLogBuffer: raw["Settings"]["max web log buffer"],
            webLogBuffer: raw["Settings"]["web log buffer"],
        },
        devices: parseDevices(raw.Devices),
    };
}

export function parseDevice(raw: RawDevice): Device {
    return {
        type: parseEnum(raw.type.toLowerCase(), DeviceType, "DeviceType"),
        name: raw.name,
        deviceId: parseInt(raw["device id"]), // given as e.g. 0x08
        productId: raw["product id"],
        version: raw.version,
        entities: raw.entities,
        handlersReceived: raw["handlers received"]
            ?.split(" ")
            .map((v) => parseInt(v)),
        handlersFetched: raw["handlers fetched"]
            ?.split(" ")
            .map((v) => parseInt(v)),
        handlersPending: raw["handlers pending"]
            ?.split(" ")
            .map((v) => parseInt(v)),
        handlersIgnored: raw["handlers ignored"]
            ?.split(" ")
            .map((v) => parseInt(v)),
    };
}

export function parseDevices(raw: RawDevice[]): Device[] {
    return raw.map(parseDevice);
}
