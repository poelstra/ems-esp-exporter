import { System, parseSystem } from "../api";

export function getExampleSystem(): System {
    return parseSystem(JSON.parse(EXAMPLE_SYSTEM_RESPONSE));
}

const EXAMPLE_SYSTEM_RESPONSE = `{
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
