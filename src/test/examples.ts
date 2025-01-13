import path = require("path");
import { parseSystem, System } from "../api";
import { Entities, Entity, readEntities, Value } from "../entities";

export const ENTITIES_CSV_PATH = "config/dump_entities.csv";
export const ENTITIES_CSV_ORIGINAL_PATH = "config/dump_entities.csv.20230128";

export async function getParsedEntities(
    csv_path: string = ENTITIES_CSV_PATH,
): Promise<Entity[]> {
    const entitiesPath = path.resolve(__dirname, "../..", csv_path);
    return readEntities(entitiesPath);
}

export function getExampleSystem(): System {
    return parseSystem(JSON.parse(EXAMPLE_SYSTEM_RESPONSE));
}

export async function getExampleDeviceValues(): Promise<Value[]> {
    const entities = new Entities(
        await getParsedEntities(ENTITIES_CSV_ORIGINAL_PATH),
    );
    return entities.parseValues(
        115,
        JSON.parse(EXAMPLE_DEVICE_ORIGINAL_RESPONSE),
    );
}

export const EXAMPLE_SYSTEM_RESPONSE = `{
    "System Info": {
      "version": "3.5.1-dev.0",
      "platform": "ESP32",
      "uptime": "007+11:10:36.612",
      "uptime (seconds)": 645036,
      "free mem": 117,
      "max alloc": 65,
      "free app": 6152,
      "reset reason": "Timer group1 watch dog reset / APP CPU reset by PRO CPU"
    },
    "Network Info": {
      "network": "WiFi",
      "hostname": "ems-esp",
      "RSSI": -57,
      "IPv4 address": "192.168.3.15/255.255.255.0",
      "IPv4 gateway": "192.168.3.1",
      "IPv4 nameserver": "192.168.3.1",
      "static ip config": false,
      "enable IPv6": false,
      "low bandwidth": false,
      "disable sleep": false,
      "enable MDNS": true,
      "enable CORS": false,
      "AP provision mode": "disconnected",
      "AP security": "wpa2",
      "AP ssid": "ems-esp"
    },
    "NTP Info": {
      "NTP status": "connected",
      "enabled": true,
      "server": "nl.pool.ntp.org",
      "tz label": "Europe/Amsterdam"
    },
    "OTA Info": {
      "enabled": false,
      "port": 8266
    },
    "MQTT Info": {
      "MQTT status": "connected",
      "MQTT publishes": 140592,
      "MQTT queued": 0,
      "MQTT publish fails": 0,
      "MQTT connects": 1,
      "enabled": true,
      "client id": "ems-esp",
      "keep alive": 60,
      "clean session": true,
      "entity format": 0,
      "base": "ems-esp",
      "discovery prefix": "homeassistant",
      "nested format": 1,
      "ha enabled": true,
      "mqtt qos": 0,
      "mqtt retain": false,
      "publish time heartbeat": 60,
      "publish time boiler": 10,
      "publish time thermostat": 10,
      "publish time solar": 10,
      "publish time mixer": 10,
      "publish time other": 10,
      "publish time sensor": 10,
      "publish single": false,
      "publish2command": false,
      "send response": false
    },
    "Syslog Info": {
      "enabled": false
    },
    "Sensor Info": {
      "temperature sensors": 0,
      "temperature sensor reads": 0,
      "temperature sensor fails": 0,
      "analog sensors": 0,
      "analog sensor reads": 0,
      "analog sensor fails": 0
    },
    "API Info": {
      "API calls": 137014,
      "API fails": 2
    },
    "Bus Info": {
      "bus status": "connected",
      "bus protocol": "Buderus",
      "bus telegrams received (rx)": 266780,
      "bus reads (tx)": 35526,
      "bus writes (tx)": 7978,
      "bus incomplete telegrams": 5,
      "bus reads failed": 0,
      "bus writes failed": 0,
      "bus rx line quality": 100,
      "bus tx line quality": 100
    },
    "Settings": {
      "board profile": "S32",
      "locale": "en",
      "tx mode": 1,
      "ems bus id": 11,
      "shower timer": false,
      "shower alert": false,
      "hide led": false,
      "notoken api": false,
      "readonly mode": false,
      "fahrenheit": false,
      "dallas parasite": false,
      "bool format": 1,
      "bool dashboard": 1,
      "enum format": 1,
      "analog enabled": true,
      "telnet enabled": true,
      "max web log buffer": 50,
      "web log buffer": 50
    },
    "Devices": [
      {
        "type": "boiler",
        "name": "Topline/GB162",
        "device id": "0x08",
        "product id": 115,
        "version": "03.06",
        "entities": 68,
        "handlers received": "0x10 0x11 0x15 0x1C 0x18 0x19 0x34",
        "handlers fetched": "0x14 0x16 0x33",
        "handlers pending": "0xBF 0xC2 0x1A 0x35 0x26 0x2A 0xD1 0xE3 0xE4 0xE5 0xE6 0xE9 0xEA"
      },
      {
        "type": "controller",
        "name": "BC10",
        "device id": "0x09",
        "product id": 114,
        "version": "01.03",
        "entities": 0
      }
    ]
  }`;

export const EXAMPLE_DEVICE_ORIGINAL_RESPONSE = `{
    "wwsettemp": 61,
    "wwseltemp": 60,
    "wwtype": "buffer",
    "wwcomfort": "hot",
    "wwflowtempoffset": 20,
    "wwcircpump": "on",
    "wwchargetype": "3-way valve",
    "wwhyston": -11,
    "wwhystoff": 0,
    "wwdisinfectiontemp": 70,
    "wwcircmode": "2x3min",
    "wwcirc": "off",
    "wwcurtemp": 43.3,
    "wwcurtemp2": 58.9,
    "wwcurflow": 0.0,
    "wwstoragetemp1": 43.3,
    "wwstoragetemp2": 58.9,
    "wwactivated": "on",
    "wwonetime": "off",
    "wwdisinfecting": "off",
    "wwcharging": "off",
    "wwrecharging": "off",
    "wwtempok": "on",
    "wwactive": "off",
    "ww3wayvalve": "off",
    "wwstarts": 29519,
    "wwworkm": 192694,
    "heatingactive": "off",
    "tapwateractive": "off",
    "selflowtemp": 20,
    "heatingpumpmod": 60,
    "curflowtemp": 25.3,
    "rettemp": 25.5,
    "switchtemp": 0.0,
    "syspress": 0.9,
    "boiltemp": 24.1,
    "burngas": "off",
    "burngas2": "off",
    "flamecurr": 0.0,
    "heatingpump": "on",
    "fanwork": "off",
    "ignwork": "off",
    "oilpreheat": "off",
    "heatingactivated": "on",
    "heatingtemp": 80,
    "pumpmodmax": 100,
    "pumpmodmin": 60,
    "pumpmode": "proportional",
    "pumpdelay": 12,
    "burnminperiod": 10,
    "burnminpower": 0,
    "burnmaxpower": 80,
    "boilhyston": -6,
    "boilhystoff": 6,
    "selburnpow": 80,
    "curburnpow": 0,
    "burnstarts": 136369,
    "burnworkmin": 1184044,
    "burn2workmin": 0,
    "heatworkmin": 991350,
    "heatstarts": 106850,
    "ubauptime": 8939385,
    "servicecode": "0Y",
    "servicecodenumber": 204,
    "maintenancemessage": "H00",
    "maintenance": "off",
    "maintenancetime": 6000,
    "maintenancedate": "01.01.2004"
  }`;
