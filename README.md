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
- [ ] Add support for more endpoints? e.g. `hc1` etc. (I don't have them, so can't test) (#1)

Any help is appreciated!

## Development

- Clone the repo
- Run `npm install`
- Run `npm run build` to build (or press `Ctrl+Shift+B` in VSCode to start the watch task)
- Export environment variables as needed
- Run `npm start`

Please use Prettier to auto-format any code before making a pull request.

## Changelog

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
# HELP emsesp_version_info EMS-ESP version
# TYPE emsesp_version_info gauge
emsesp_version_info{version="3.7.1"} 1

# HELP emsesp_heatingoff force heating off [boolean]
# TYPE emsesp_heatingoff gauge
emsesp_heatingoff{device_id="8",product_id="115"} 0

# HELP emsesp_heatingactive heating active [boolean]
# TYPE emsesp_heatingactive gauge
emsesp_heatingactive{device_id="8",product_id="115"} 1

# HELP emsesp_tapwateractive tapwater active [boolean]
# TYPE emsesp_tapwateractive gauge
emsesp_tapwateractive{device_id="8",product_id="115"} 0

# HELP emsesp_selflowtemp selected flow temperature [C]
# TYPE emsesp_selflowtemp gauge
emsesp_selflowtemp{device_id="8",product_id="115"} 59

# HELP emsesp_heatingpumpmod heating pump modulation [%]
# TYPE emsesp_heatingpumpmod gauge
emsesp_heatingpumpmod{device_id="8",product_id="115"} 0.6

# HELP emsesp_curflowtemp current flow temperature [C]
# TYPE emsesp_curflowtemp gauge
emsesp_curflowtemp{device_id="8",product_id="115"} 58

# HELP emsesp_rettemp return temperature [C]
# TYPE emsesp_rettemp gauge
emsesp_rettemp{device_id="8",product_id="115"} 51

# HELP emsesp_switchtemp mixing switch temperature [C]
# TYPE emsesp_switchtemp gauge
emsesp_switchtemp{device_id="8",product_id="115"} 0

# HELP emsesp_syspress system pressure [bar]
# TYPE emsesp_syspress gauge
emsesp_syspress{device_id="8",product_id="115"} 1.3

# HELP emsesp_boiltemp actual boiler temperature [C]
# TYPE emsesp_boiltemp gauge
emsesp_boiltemp{device_id="8",product_id="115"} 54.3

# HELP emsesp_burngas gas [boolean]
# TYPE emsesp_burngas gauge
emsesp_burngas{device_id="8",product_id="115"} 1

# HELP emsesp_burngas2 gas stage 2 [boolean]
# TYPE emsesp_burngas2 gauge
emsesp_burngas2{device_id="8",product_id="115"} 0

# HELP emsesp_flamecurr flame current [µA]
# TYPE emsesp_flamecurr gauge
emsesp_flamecurr{device_id="8",product_id="115"} 5

# HELP emsesp_fanwork fan [boolean]
# TYPE emsesp_fanwork gauge
emsesp_fanwork{device_id="8",product_id="115"} 1

# HELP emsesp_ignwork ignition [boolean]
# TYPE emsesp_ignwork gauge
emsesp_ignwork{device_id="8",product_id="115"} 0

# HELP emsesp_oilpreheat oil preheating [boolean]
# TYPE emsesp_oilpreheat gauge
emsesp_oilpreheat{device_id="8",product_id="115"} 0

# HELP emsesp_burnminpower burner min power [%]
# TYPE emsesp_burnminpower gauge
emsesp_burnminpower{device_id="8",product_id="115"} 0

# HELP emsesp_burnmaxpower burner max power [%]
# TYPE emsesp_burnmaxpower gauge
emsesp_burnmaxpower{device_id="8",product_id="115"} 0.8

# HELP emsesp_burnminperiod burner min period [minutes]
# TYPE emsesp_burnminperiod gauge
emsesp_burnminperiod{device_id="8",product_id="115"} 10

# HELP emsesp_boilhyston hysteresis on temperature [C]
# TYPE emsesp_boilhyston gauge
emsesp_boilhyston{device_id="8",product_id="115"} -6

# HELP emsesp_boilhystoff hysteresis off temperature [C]
# TYPE emsesp_boilhystoff gauge
emsesp_boilhystoff{device_id="8",product_id="115"} 6

# HELP emsesp_heatingactivated heating activated [boolean]
# TYPE emsesp_heatingactivated gauge
emsesp_heatingactivated{device_id="8",product_id="115"} 1

# HELP emsesp_heatingtemp heating temperature [C]
# TYPE emsesp_heatingtemp gauge
emsesp_heatingtemp{device_id="8",product_id="115"} 80

# HELP emsesp_heatingpump heating pump [boolean]
# TYPE emsesp_heatingpump gauge
emsesp_heatingpump{device_id="8",product_id="115"} 1

# HELP emsesp_pumpmodmax boiler pump max power [%]
# TYPE emsesp_pumpmodmax gauge
emsesp_pumpmodmax{device_id="8",product_id="115"} 1

# HELP emsesp_pumpmodmin boiler pump min power [%]
# TYPE emsesp_pumpmodmin gauge
emsesp_pumpmodmin{device_id="8",product_id="115"} 0.6

# HELP emsesp_pumpmode boiler pump mode [enum]
# TYPE emsesp_pumpmode gauge
emsesp_pumpmode{emsesp_pumpmode="proportional",device_id="8",product_id="115"} 1
emsesp_pumpmode{emsesp_pumpmode="deltaP-1",device_id="8",product_id="115"} 0
emsesp_pumpmode{emsesp_pumpmode="deltaP-2",device_id="8",product_id="115"} 0
emsesp_pumpmode{emsesp_pumpmode="deltaP-3",device_id="8",product_id="115"} 0
emsesp_pumpmode{emsesp_pumpmode="deltaP-4",device_id="8",product_id="115"} 0

# HELP emsesp_pumpdelay pump delay [minutes]
# TYPE emsesp_pumpdelay gauge
emsesp_pumpdelay{device_id="8",product_id="115"} 12

# HELP emsesp_selburnpow burner selected max power [%]
# TYPE emsesp_selburnpow gauge
emsesp_selburnpow{device_id="8",product_id="115"} 0.8

# HELP emsesp_curburnpow burner current power [%]
# TYPE emsesp_curburnpow gauge
emsesp_curburnpow{device_id="8",product_id="115"} 0.17

# HELP emsesp_burnstarts burner starts [uint24]
# TYPE emsesp_burnstarts gauge
emsesp_burnstarts{device_id="8",product_id="115"} 136571

# HELP emsesp_burnworkmin total burner operating time [seconds]
# TYPE emsesp_burnworkmin counter
emsesp_burnworkmin{device_id="8",product_id="115"} 71347080

# HELP emsesp_burn2workmin burner stage 2 operating time [seconds]
# TYPE emsesp_burn2workmin counter
emsesp_burn2workmin{device_id="8",product_id="115"} 0

# HELP emsesp_heatworkmin total heat operating time [seconds]
# TYPE emsesp_heatworkmin counter
emsesp_heatworkmin{device_id="8",product_id="115"} 59772060

# HELP emsesp_heatstarts burner starts heating [uint24]
# TYPE emsesp_heatstarts gauge
emsesp_heatstarts{device_id="8",product_id="115"} 107038

# HELP emsesp_ubauptime total UBA operating time [seconds]
# TYPE emsesp_ubauptime counter
emsesp_ubauptime{device_id="8",product_id="115"} 536977620

# HELP emsesp_servicecode service code [string]
# TYPE emsesp_servicecode gauge
emsesp_servicecode{emsesp_servicecode="-H",device_id="8",product_id="115"} 1

# HELP emsesp_servicecodenumber service code number [uint16]
# TYPE emsesp_servicecodenumber gauge
emsesp_servicecodenumber{device_id="8",product_id="115"} 200

# HELP emsesp_maintenancemessage maintenance message [string]
# TYPE emsesp_maintenancemessage gauge
emsesp_maintenancemessage{emsesp_maintenancemessage="H00",device_id="8",product_id="115"} 1

# HELP emsesp_maintenance maintenance scheduled [enum]
# TYPE emsesp_maintenance gauge
emsesp_maintenance{emsesp_maintenance="off",device_id="8",product_id="115"} 1
emsesp_maintenance{emsesp_maintenance="time",device_id="8",product_id="115"} 0
emsesp_maintenance{emsesp_maintenance="date",device_id="8",product_id="115"} 0
emsesp_maintenance{emsesp_maintenance="manual",device_id="8",product_id="115"} 0

# HELP emsesp_maintenancetime time to next maintenance [hours]
# TYPE emsesp_maintenancetime gauge
emsesp_maintenancetime{device_id="8",product_id="115"} 6000

# HELP emsesp_maintenancedate next maintenance date [string]
# TYPE emsesp_maintenancedate gauge
emsesp_maintenancedate{emsesp_maintenancedate="01.01.2004",device_id="8",product_id="115"} 1

# HELP emsesp_nompower nominal Power [kW]
# TYPE emsesp_nompower gauge
emsesp_nompower{device_id="8",product_id="115"} 30

# HELP emsesp_nrgtotal total energy [kWh]
# TYPE emsesp_nrgtotal gauge
emsesp_nrgtotal{device_id="8",product_id="115"} 20.98

# HELP emsesp_nrgheat energy heating [kWh]
# TYPE emsesp_nrgheat gauge
emsesp_nrgheat{device_id="8",product_id="115"} 20.98

# HELP emsesp_dhw_settemp set temperature [C]
# TYPE emsesp_dhw_settemp gauge
emsesp_dhw_settemp{device_id="8",product_id="115"} 61

# HELP emsesp_dhw_seltemp selected temperature [C]
# TYPE emsesp_dhw_seltemp gauge
emsesp_dhw_seltemp{device_id="8",product_id="115"} 60

# HELP emsesp_dhw_type type [enum]
# TYPE emsesp_dhw_type gauge
emsesp_dhw_type{emsesp_dhw_type="off",device_id="8",product_id="115"} 0
emsesp_dhw_type{emsesp_dhw_type="flow",device_id="8",product_id="115"} 0
emsesp_dhw_type{emsesp_dhw_type="buffered flow",device_id="8",product_id="115"} 0
emsesp_dhw_type{emsesp_dhw_type="buffer",device_id="8",product_id="115"} 1
emsesp_dhw_type{emsesp_dhw_type="layered buffer",device_id="8",product_id="115"} 0

# HELP emsesp_dhw_comfort comfort [enum]
# TYPE emsesp_dhw_comfort gauge
emsesp_dhw_comfort{emsesp_dhw_comfort="hot",device_id="8",product_id="115"} 1
emsesp_dhw_comfort{emsesp_dhw_comfort="eco",device_id="8",product_id="115"} 0
emsesp_dhw_comfort{emsesp_dhw_comfort="intelligent",device_id="8",product_id="115"} 0

# HELP emsesp_dhw_flowtempoffset flow temperature offset [C]
# TYPE emsesp_dhw_flowtempoffset gauge
emsesp_dhw_flowtempoffset{device_id="8",product_id="115"} 20

# HELP emsesp_dhw_circpump circulation pump available [boolean]
# TYPE emsesp_dhw_circpump gauge
emsesp_dhw_circpump{device_id="8",product_id="115"} 1

# HELP emsesp_dhw_chargetype charging type [enum]
# TYPE emsesp_dhw_chargetype gauge
emsesp_dhw_chargetype{emsesp_dhw_chargetype="chargepump",device_id="8",product_id="115"} 0
emsesp_dhw_chargetype{emsesp_dhw_chargetype="3-way valve",device_id="8",product_id="115"} 1

# HELP emsesp_dhw_hyston hysteresis on temperature [C]
# TYPE emsesp_dhw_hyston gauge
emsesp_dhw_hyston{device_id="8",product_id="115"} -11

# HELP emsesp_dhw_hystoff hysteresis off temperature [C]
# TYPE emsesp_dhw_hystoff gauge
emsesp_dhw_hystoff{device_id="8",product_id="115"} 0

# HELP emsesp_dhw_disinfectiontemp disinfection temperature [C]
# TYPE emsesp_dhw_disinfectiontemp gauge
emsesp_dhw_disinfectiontemp{device_id="8",product_id="115"} 70

# HELP emsesp_dhw_circmode circulation pump mode [enum]
# TYPE emsesp_dhw_circmode gauge
emsesp_dhw_circmode{emsesp_dhw_circmode="off",device_id="8",product_id="115"} 0
emsesp_dhw_circmode{emsesp_dhw_circmode="1x3min",device_id="8",product_id="115"} 0
emsesp_dhw_circmode{emsesp_dhw_circmode="2x3min",device_id="8",product_id="115"} 1
emsesp_dhw_circmode{emsesp_dhw_circmode="3x3min",device_id="8",product_id="115"} 0
emsesp_dhw_circmode{emsesp_dhw_circmode="4x3min",device_id="8",product_id="115"} 0
emsesp_dhw_circmode{emsesp_dhw_circmode="5x3min",device_id="8",product_id="115"} 0
emsesp_dhw_circmode{emsesp_dhw_circmode="6x3min",device_id="8",product_id="115"} 0
emsesp_dhw_circmode{emsesp_dhw_circmode="continuous",device_id="8",product_id="115"} 0

# HELP emsesp_dhw_circ circulation active [boolean]
# TYPE emsesp_dhw_circ gauge
emsesp_dhw_circ{device_id="8",product_id="115"} 0

# HELP emsesp_dhw_curtemp current intern temperature [C]
# TYPE emsesp_dhw_curtemp gauge
emsesp_dhw_curtemp{device_id="8",product_id="115"} 44.1

# HELP emsesp_dhw_curtemp2 current extern temperature [C]
# TYPE emsesp_dhw_curtemp2 gauge
emsesp_dhw_curtemp2{device_id="8",product_id="115"} 57.4

# HELP emsesp_dhw_curflow current tap water flow [l/min]
# TYPE emsesp_dhw_curflow gauge
emsesp_dhw_curflow{device_id="8",product_id="115"} 0

# HELP emsesp_dhw_storagetemp1 storage intern temperature [C]
# TYPE emsesp_dhw_storagetemp1 gauge
emsesp_dhw_storagetemp1{device_id="8",product_id="115"} 44.1

# HELP emsesp_dhw_storagetemp2 storage extern temperature [C]
# TYPE emsesp_dhw_storagetemp2 gauge
emsesp_dhw_storagetemp2{device_id="8",product_id="115"} 57.5

# HELP emsesp_dhw_activated activated [boolean]
# TYPE emsesp_dhw_activated gauge
emsesp_dhw_activated{device_id="8",product_id="115"} 1

# HELP emsesp_dhw_onetime one time charging [boolean]
# TYPE emsesp_dhw_onetime gauge
emsesp_dhw_onetime{device_id="8",product_id="115"} 0

# HELP emsesp_dhw_disinfecting disinfecting [boolean]
# TYPE emsesp_dhw_disinfecting gauge
emsesp_dhw_disinfecting{device_id="8",product_id="115"} 0

# HELP emsesp_dhw_charging charging [boolean]
# TYPE emsesp_dhw_charging gauge
emsesp_dhw_charging{device_id="8",product_id="115"} 0

# HELP emsesp_dhw_recharging recharging [boolean]
# TYPE emsesp_dhw_recharging gauge
emsesp_dhw_recharging{device_id="8",product_id="115"} 0

# HELP emsesp_dhw_tempok temperature ok [boolean]
# TYPE emsesp_dhw_tempok gauge
emsesp_dhw_tempok{device_id="8",product_id="115"} 1

# HELP emsesp_dhw_active active [boolean]
# TYPE emsesp_dhw_active gauge
emsesp_dhw_active{device_id="8",product_id="115"} 0

# HELP emsesp_dhw_3wayvalve 3-way valve active [boolean]
# TYPE emsesp_dhw_3wayvalve gauge
emsesp_dhw_3wayvalve{device_id="8",product_id="115"} 0

# HELP emsesp_dhw_starts starts [uint24]
# TYPE emsesp_dhw_starts gauge
emsesp_dhw_starts{device_id="8",product_id="115"} 29533

# HELP emsesp_dhw_workm active time [seconds]
# TYPE emsesp_dhw_workm counter
emsesp_dhw_workm{device_id="8",product_id="115"} 11575020

# HELP emsesp_dhw_nrg energy [kWh]
# TYPE emsesp_dhw_nrg gauge
emsesp_dhw_nrg{device_id="8",product_id="115"} 0
```

## License

MIT license.
Copyright (C) 2023 Martin Poelstra
