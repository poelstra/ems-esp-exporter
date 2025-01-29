# Prometheus metrics exporter for EMS-ESP

This Prometheus metrics exporter exposes metrics of [EMS-ESP](https://docs.emsesp.org/).

EMS-ESP is an open-source firmware for the Espressif ESP32 microcontroller that communicates with
EMS (Energy Management System) based equipment from manufacturers like Bosch, Buderus, Nefit, Junkers,
Worcester and Sieger.

Whenever metrics are requested (on its `/metrics` endpoint), it polls EMS-ESP to fetch the latest
values. It converts these into Prometheus metrics.
It supports automatic conversion of numerical, boolean and even enumerations into the proper format,
and uses the correct type (Gauge or Counter) as needed.

Note: this converter doesn't use MQTT, and should work with all EMS-ESP value settings ("on"/"true"/"1"/etc).

## Usage

The easiest is to grab the Docker image:

```sh
docker run -p 3000:3000 -e EMS_ESP_URL="http://<your_esp_address>" poelstra/ems-esp-exporter:latest
```

Alternatively, see the `docker-compose.yml`, or build from source, see below.

Then, point your Prometheus scraper to `http://<your_exporter>:3000/metrics`.
See below for some example output.

Please :star: the project on GitHub if you like it!

## Configuration

Configuration is done through environment variables (given values are the defaults):

- `EMS_ESP_URL=http://ems-esp.local`: Hostname/port of EMS-ESP.
- `METRICS_PORT=3000`: HTTP port on which the `/metrics` endpoint is served.
- `EMS_INSTANCE=`: (Optional) instance label to add to each metric (e.g. `{instance="test"}`)

If you're running EMS-ESP version 3.7.0 or newer, it automatically fetches the
entity definitions from the device, and you no longer need `dump_entities.csv`.

### Entity configuration file for EMS-ESP <3.7.0

In case you're running EMS-ESP older than version 3.7.0, you need `dump_entities.csv`.

The Docker image contains a snapshot of it, but it may not be the correct version for
your specific EMS-ESP firmware. You can download a more recent one from
https://docs.emsesp.org/data/dump_entities.csv if needed.

You can then mount that custom version as a Docker volume.

- `ENTITIES_CSV=/app/config/dump_entities.csv`: Path to `dump_entities.csv` inside the Docker
  container.

## TODO / Limitations

- [x] Find out how to fetch the available list of devices, to then query all of them. Currently only the `boiler` device is supported.
- [x] Add support for latest `<device>/entities` endpoint to get rid of dump_entities.csv. (#2)
- [x] Add support for more endpoints? e.g. `hc1` etc. (I don't have them, so can't test) (#1)
- [x] Correctly set Counter type for such entities when using `/entities` endpoint (Prometheus seems to ignore it, but still). Needs support in EMS-ESP (>=3.7.2).
- [ ] Allow choosing between English and localized enums (requires support from EMS-ESP, e.g. `enumEN` field)

Any help is appreciated!

## Development

- Clone the repo
- Run `npm install`
- Run `npm run build` to build (or press `Ctrl+Shift+B` in VSCode to start the watch task)
- Export environment variables as needed
- Run `npm start`

Please use Prettier to auto-format any code before making a pull request.

## Changelog

See Git diffs for the detailed differences. Most notable changes for each version:

- v0.5.0 (2025-01-28):

    - Rename `emsesp_version` to `emsesp_system_version` for consistency.
    - Add a few more system metrics (memory, uptime).
    - Handle multiple devices (e.g. thermostats) of the same type (hc1, hc2, etc.)
    - Allow setting EMS instance as metric labels (optional).
    - Remove product and deviceID labels, would not be correct for multiple circuits.
    - Correctly detect counters (vs gauges) on EMS-ESP >=3.7.2 (to be released).

- v0.4.0 (2025-01-25):

    - Updated all metric names to include device type to support different devices having the same entity names.
        - For example, `emsesp_dhw_circmode` is now changed to `emsesp_boiler_dhw_circmode`.
    - Use `<device>/entities` endpoints on EMS-ESP >=3.7. No need for `dump_entities.csv` anymore in this case.
    - Early support for localized settings: correctly parses booleans, but enums will be in the local language.
    - All minutes-based metrics are now converted to seconds to comply with Prometheus recommendations.
    - Make EMS-ESP version number metric name consistent.
    - Skip entities that don't have a value.

- v0.3.0 (2025-01-20):

    - Support for EMS-ESP v3.7 (#4)
        - v3.5 should still be supported, but you may need to explicitly use an older `dump_entities.csv` file.
        - Some metrics are renamed, because EMS-ESP has renamed `ww` to `dhw` and moved them to a `dhw` namespace.
    - Updated all dependencies to latest

- v0.2.0 (2023-12-13):

    - Improve internal server error handling
    - Add some string metrics
    - Auto-iterate all devices

- v0.1.0 (2023-01-29):
    - Initial version

## Example metrics output

```sh
curl http://localhost:3000/metrics
```

```txt
# HELP emsesp_system_version EMS-ESP version
# TYPE emsesp_system_version gauge
emsesp_system_version{emsesp_system_version="3.7.1"} 1

# HELP emsesp_system_uptime_seconds EMS-ESP uptime [seconds]
# TYPE emsesp_system_uptime_seconds gauge
emsesp_system_uptime_seconds 816511

# HELP emsesp_system_mem_free_bytes EMS-ESP free memory [bytes]
# TYPE emsesp_system_mem_free_bytes gauge
emsesp_system_mem_free_bytes 177152

# HELP emsesp_system_mem_max_alloc_bytes EMS-ESP maximum allocated memory [bytes]
# TYPE emsesp_system_mem_max_alloc_bytes gauge
emsesp_system_mem_max_alloc_bytes 109568

# HELP emsesp_system_app_free_bytes EMS-ESP free application memory [bytes]
# TYPE emsesp_system_app_free_bytes gauge
emsesp_system_app_free_bytes 6541312

# HELP emsesp_boiler_heatingoff force heating off [boolean]
# TYPE emsesp_boiler_heatingoff gauge
emsesp_boiler_heatingoff 0

# HELP emsesp_boiler_heatingactive heating active [boolean]
# TYPE emsesp_boiler_heatingactive gauge
emsesp_boiler_heatingactive 1

# HELP emsesp_boiler_tapwateractive tapwater active [boolean]
# TYPE emsesp_boiler_tapwateractive gauge
emsesp_boiler_tapwateractive 0

# HELP emsesp_boiler_selflowtemp selected flow temperature [°C]
# TYPE emsesp_boiler_selflowtemp gauge
emsesp_boiler_selflowtemp 56

# HELP emsesp_boiler_heatingpumpmod heating pump modulation [%]
# TYPE emsesp_boiler_heatingpumpmod gauge
emsesp_boiler_heatingpumpmod 0.62

# HELP emsesp_boiler_curflowtemp current flow temperature [°C]
# TYPE emsesp_boiler_curflowtemp gauge
emsesp_boiler_curflowtemp 55.6

# HELP emsesp_boiler_rettemp return temperature [°C]
# TYPE emsesp_boiler_rettemp gauge
emsesp_boiler_rettemp 47.4

# HELP emsesp_boiler_switchtemp mixing switch temperature [°C]
# TYPE emsesp_boiler_switchtemp gauge
emsesp_boiler_switchtemp 0

# HELP emsesp_boiler_syspress system pressure [bar]
# TYPE emsesp_boiler_syspress gauge
emsesp_boiler_syspress 2

# HELP emsesp_boiler_boiltemp actual boiler temperature [°C]
# TYPE emsesp_boiler_boiltemp gauge
emsesp_boiler_boiltemp 51.7

# HELP emsesp_boiler_burngas gas [boolean]
# TYPE emsesp_boiler_burngas gauge
emsesp_boiler_burngas 1

# HELP emsesp_boiler_burngas2 gas stage 2 [boolean]
# TYPE emsesp_boiler_burngas2 gauge
emsesp_boiler_burngas2 0

# HELP emsesp_boiler_flamecurr flame current [µA]
# TYPE emsesp_boiler_flamecurr gauge
emsesp_boiler_flamecurr 8.4

# HELP emsesp_boiler_fanwork fan [boolean]
# TYPE emsesp_boiler_fanwork gauge
emsesp_boiler_fanwork 1

# HELP emsesp_boiler_ignwork ignition [boolean]
# TYPE emsesp_boiler_ignwork gauge
emsesp_boiler_ignwork 0

# HELP emsesp_boiler_oilpreheat oil preheating [boolean]
# TYPE emsesp_boiler_oilpreheat gauge
emsesp_boiler_oilpreheat 0

# HELP emsesp_boiler_burnminpower burner min power [%]
# TYPE emsesp_boiler_burnminpower gauge
emsesp_boiler_burnminpower 0

# HELP emsesp_boiler_burnmaxpower burner max power [%]
# TYPE emsesp_boiler_burnmaxpower gauge
emsesp_boiler_burnmaxpower 0.8

# HELP emsesp_boiler_burnminperiod burner min period [seconds]
# TYPE emsesp_boiler_burnminperiod gauge
emsesp_boiler_burnminperiod 600

# HELP emsesp_boiler_boilhyston hysteresis on temperature [°C]
# TYPE emsesp_boiler_boilhyston gauge
emsesp_boiler_boilhyston -6

# HELP emsesp_boiler_boilhystoff hysteresis off temperature [°C]
# TYPE emsesp_boiler_boilhystoff gauge
emsesp_boiler_boilhystoff 6

# HELP emsesp_boiler_heatingactivated heating activated [boolean]
# TYPE emsesp_boiler_heatingactivated gauge
emsesp_boiler_heatingactivated 1

# HELP emsesp_boiler_heatingtemp heating temperature [°C]
# TYPE emsesp_boiler_heatingtemp gauge
emsesp_boiler_heatingtemp 80

# HELP emsesp_boiler_heatingpump heating pump [boolean]
# TYPE emsesp_boiler_heatingpump gauge
emsesp_boiler_heatingpump 1

# HELP emsesp_boiler_pumpmodmax boiler pump max power [%]
# TYPE emsesp_boiler_pumpmodmax gauge
emsesp_boiler_pumpmodmax 1

# HELP emsesp_boiler_pumpmodmin boiler pump min power [%]
# TYPE emsesp_boiler_pumpmodmin gauge
emsesp_boiler_pumpmodmin 0.6

# HELP emsesp_boiler_pumpmode boiler pump mode [enum]
# TYPE emsesp_boiler_pumpmode gauge
emsesp_boiler_pumpmode{emsesp_boiler_pumpmode="proportional"} 1
emsesp_boiler_pumpmode{emsesp_boiler_pumpmode="deltaP-1"} 0
emsesp_boiler_pumpmode{emsesp_boiler_pumpmode="deltaP-2"} 0
emsesp_boiler_pumpmode{emsesp_boiler_pumpmode="deltaP-3"} 0
emsesp_boiler_pumpmode{emsesp_boiler_pumpmode="deltaP-4"} 0

# HELP emsesp_boiler_pumpdelay pump delay [seconds]
# TYPE emsesp_boiler_pumpdelay gauge
emsesp_boiler_pumpdelay 720

# HELP emsesp_boiler_selburnpow burner selected max power [%]
# TYPE emsesp_boiler_selburnpow gauge
emsesp_boiler_selburnpow 0.8

# HELP emsesp_boiler_curburnpow burner current power [%]
# TYPE emsesp_boiler_curburnpow gauge
emsesp_boiler_curburnpow 0.21

# HELP emsesp_boiler_burnstarts burner starts [number]
# TYPE emsesp_boiler_burnstarts gauge
emsesp_boiler_burnstarts 136793

# HELP emsesp_boiler_burnworkmin total burner operating time [seconds]
# TYPE emsesp_boiler_burnworkmin gauge
emsesp_boiler_burnworkmin 71650020

# HELP emsesp_boiler_burn2workmin burner stage 2 operating time [seconds]
# TYPE emsesp_boiler_burn2workmin gauge
emsesp_boiler_burn2workmin 0

# HELP emsesp_boiler_heatworkmin total heat operating time [seconds]
# TYPE emsesp_boiler_heatworkmin gauge
emsesp_boiler_heatworkmin 60057240

# HELP emsesp_boiler_heatstarts burner starts heating [number]
# TYPE emsesp_boiler_heatstarts gauge
emsesp_boiler_heatstarts 107235

# HELP emsesp_boiler_ubauptime total UBA operating time [seconds]
# TYPE emsesp_boiler_ubauptime gauge
emsesp_boiler_ubauptime 537788880

# HELP emsesp_boiler_servicecode service code [string]
# TYPE emsesp_boiler_servicecode gauge
emsesp_boiler_servicecode{emsesp_boiler_servicecode="-H"} 1

# HELP emsesp_boiler_servicecodenumber service code number [number]
# TYPE emsesp_boiler_servicecodenumber gauge
emsesp_boiler_servicecodenumber 200

# HELP emsesp_boiler_maintenancemessage maintenance message [string]
# TYPE emsesp_boiler_maintenancemessage gauge
emsesp_boiler_maintenancemessage{emsesp_boiler_maintenancemessage="H00"} 1

# HELP emsesp_boiler_maintenance maintenance scheduled [enum]
# TYPE emsesp_boiler_maintenance gauge
emsesp_boiler_maintenance{emsesp_boiler_maintenance="off"} 1
emsesp_boiler_maintenance{emsesp_boiler_maintenance="time"} 0
emsesp_boiler_maintenance{emsesp_boiler_maintenance="date"} 0
emsesp_boiler_maintenance{emsesp_boiler_maintenance="manual"} 0

# HELP emsesp_boiler_maintenancetime time to next maintenance [hours]
# TYPE emsesp_boiler_maintenancetime gauge
emsesp_boiler_maintenancetime 6000

# HELP emsesp_boiler_maintenancedate next maintenance date [string]
# TYPE emsesp_boiler_maintenancedate gauge
emsesp_boiler_maintenancedate{emsesp_boiler_maintenancedate="01.01.2004"} 1

# HELP emsesp_boiler_dhw_settemp dhw set temperature [°C]
# TYPE emsesp_boiler_dhw_settemp gauge
emsesp_boiler_dhw_settemp 61

# HELP emsesp_boiler_dhw_seltemp dhw selected temperature [°C]
# TYPE emsesp_boiler_dhw_seltemp gauge
emsesp_boiler_dhw_seltemp 60

# HELP emsesp_boiler_dhw_type dhw type [enum]
# TYPE emsesp_boiler_dhw_type gauge
emsesp_boiler_dhw_type{emsesp_boiler_dhw_type="off"} 0
emsesp_boiler_dhw_type{emsesp_boiler_dhw_type="flow"} 0
emsesp_boiler_dhw_type{emsesp_boiler_dhw_type="buffered flow"} 0
emsesp_boiler_dhw_type{emsesp_boiler_dhw_type="buffer"} 1
emsesp_boiler_dhw_type{emsesp_boiler_dhw_type="layered buffer"} 0

# HELP emsesp_boiler_dhw_comfort dhw comfort [enum]
# TYPE emsesp_boiler_dhw_comfort gauge
emsesp_boiler_dhw_comfort{emsesp_boiler_dhw_comfort="hot"} 1
emsesp_boiler_dhw_comfort{emsesp_boiler_dhw_comfort="eco"} 0
emsesp_boiler_dhw_comfort{emsesp_boiler_dhw_comfort="intelligent"} 0

# HELP emsesp_boiler_dhw_flowtempoffset dhw flow temperature offset [°C]
# TYPE emsesp_boiler_dhw_flowtempoffset gauge
emsesp_boiler_dhw_flowtempoffset 20

# HELP emsesp_boiler_dhw_circpump dhw circulation pump available [boolean]
# TYPE emsesp_boiler_dhw_circpump gauge
emsesp_boiler_dhw_circpump 1

# HELP emsesp_boiler_dhw_chargetype dhw charging type [enum]
# TYPE emsesp_boiler_dhw_chargetype gauge
emsesp_boiler_dhw_chargetype{emsesp_boiler_dhw_chargetype="chargepump"} 0
emsesp_boiler_dhw_chargetype{emsesp_boiler_dhw_chargetype="3-way valve"} 1

# HELP emsesp_boiler_dhw_hyston dhw hysteresis on temperature [°C]
# TYPE emsesp_boiler_dhw_hyston gauge
emsesp_boiler_dhw_hyston -11

# HELP emsesp_boiler_dhw_hystoff dhw hysteresis off temperature [°C]
# TYPE emsesp_boiler_dhw_hystoff gauge
emsesp_boiler_dhw_hystoff 0

# HELP emsesp_boiler_dhw_disinfectiontemp dhw disinfection temperature [°C]
# TYPE emsesp_boiler_dhw_disinfectiontemp gauge
emsesp_boiler_dhw_disinfectiontemp 70

# HELP emsesp_boiler_dhw_circmode dhw circulation pump mode [enum]
# TYPE emsesp_boiler_dhw_circmode gauge
emsesp_boiler_dhw_circmode{emsesp_boiler_dhw_circmode="off"} 0
emsesp_boiler_dhw_circmode{emsesp_boiler_dhw_circmode="1x3min"} 0
emsesp_boiler_dhw_circmode{emsesp_boiler_dhw_circmode="2x3min"} 1
emsesp_boiler_dhw_circmode{emsesp_boiler_dhw_circmode="3x3min"} 0
emsesp_boiler_dhw_circmode{emsesp_boiler_dhw_circmode="4x3min"} 0
emsesp_boiler_dhw_circmode{emsesp_boiler_dhw_circmode="5x3min"} 0
emsesp_boiler_dhw_circmode{emsesp_boiler_dhw_circmode="6x3min"} 0
emsesp_boiler_dhw_circmode{emsesp_boiler_dhw_circmode="continuous"} 0

# HELP emsesp_boiler_dhw_circ dhw circulation active [boolean]
# TYPE emsesp_boiler_dhw_circ gauge
emsesp_boiler_dhw_circ 0

# HELP emsesp_boiler_dhw_curtemp dhw current intern temperature [°C]
# TYPE emsesp_boiler_dhw_curtemp gauge
emsesp_boiler_dhw_curtemp 42.7

# HELP emsesp_boiler_dhw_curtemp2 dhw current extern temperature [°C]
# TYPE emsesp_boiler_dhw_curtemp2 gauge
emsesp_boiler_dhw_curtemp2 54.3

# HELP emsesp_boiler_dhw_curflow dhw current tap water flow [l/min]
# TYPE emsesp_boiler_dhw_curflow gauge
emsesp_boiler_dhw_curflow 0

# HELP emsesp_boiler_dhw_storagetemp1 dhw storage intern temperature [°C]
# TYPE emsesp_boiler_dhw_storagetemp1 gauge
emsesp_boiler_dhw_storagetemp1 42.7

# HELP emsesp_boiler_dhw_storagetemp2 dhw storage extern temperature [°C]
# TYPE emsesp_boiler_dhw_storagetemp2 gauge
emsesp_boiler_dhw_storagetemp2 54.3

# HELP emsesp_boiler_dhw_activated dhw activated [boolean]
# TYPE emsesp_boiler_dhw_activated gauge
emsesp_boiler_dhw_activated 1

# HELP emsesp_boiler_dhw_onetime dhw one time charging [boolean]
# TYPE emsesp_boiler_dhw_onetime gauge
emsesp_boiler_dhw_onetime 0

# HELP emsesp_boiler_dhw_disinfecting dhw disinfecting [boolean]
# TYPE emsesp_boiler_dhw_disinfecting gauge
emsesp_boiler_dhw_disinfecting 0

# HELP emsesp_boiler_dhw_charging dhw charging [boolean]
# TYPE emsesp_boiler_dhw_charging gauge
emsesp_boiler_dhw_charging 0

# HELP emsesp_boiler_dhw_recharging dhw recharging [boolean]
# TYPE emsesp_boiler_dhw_recharging gauge
emsesp_boiler_dhw_recharging 0

# HELP emsesp_boiler_dhw_tempok dhw temperature ok [boolean]
# TYPE emsesp_boiler_dhw_tempok gauge
emsesp_boiler_dhw_tempok 1

# HELP emsesp_boiler_dhw_active dhw active [boolean]
# TYPE emsesp_boiler_dhw_active gauge
emsesp_boiler_dhw_active 0

# HELP emsesp_boiler_dhw_3wayvalve dhw 3-way valve active [boolean]
# TYPE emsesp_boiler_dhw_3wayvalve gauge
emsesp_boiler_dhw_3wayvalve 0

# HELP emsesp_boiler_dhw_starts dhw starts [number]
# TYPE emsesp_boiler_dhw_starts gauge
emsesp_boiler_dhw_starts 29558

# HELP emsesp_boiler_dhw_workm dhw active time [seconds]
# TYPE emsesp_boiler_dhw_workm gauge
emsesp_boiler_dhw_workm 11592780

# HELP emsesp_boiler_nompower nominal Power [kW]
# TYPE emsesp_boiler_nompower gauge
emsesp_boiler_nompower 30

# HELP emsesp_boiler_nrgtotal total energy [kWh]
# TYPE emsesp_boiler_nrgtotal gauge
emsesp_boiler_nrgtotal 664.84

# HELP emsesp_boiler_nrgheat energy heating [kWh]
# TYPE emsesp_boiler_nrgheat counter
emsesp_boiler_nrgheat 618.04

# HELP emsesp_boiler_dhw_nrg dhw energy [kWh]
# TYPE emsesp_boiler_dhw_nrg counter
emsesp_boiler_dhw_nrg 46.8
```

## License

MIT license.
Copyright (C) 2023 Martin Poelstra
