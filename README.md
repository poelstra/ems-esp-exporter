# Prometheus metrics exporter for EMS-ESP

This Prometheus metrics exporter exposes metrics of [EMS-ESP](https://emsesp.github.io/docs/).

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

Configuration is done through environment variables:

-   `EMS_ESP_URL=http://ems-esp.local`: Hostname/port of EMS-ESP.
-   `METRICS_PORT=3000`: HTTP port on which the `/metrics` endpoint is served.
-   `ENTITIES_CSV=/app/config/dump_entities.csv`: Meta-data for each entry is loaded from `dump_entities.csv`.
    A snapshot of that file is bundled with the app, but you can download a more recent one from https://emsesp.github.io/docs/data/dump_entities.csv
    if needed, and pass it in through a Docker volume.

## TODO / Limitations

-   Find out how to fetch the available list of devices, to then query all of them. Currently only the `boiler` device is supported.
-   Add support for more endpoints, e.g. `hc1` etc.

Any help is appreciated!

## Development

-   Clone the repo
-   Run `npm install`
-   Run `npm run build` to build (or press `Ctrl+Shift+B` in VSCode to start the watch task)
-   Export environment variables as needed
-   Run `npm start`

Please use Prettier to auto-format any code before making a pull request.

## Changelog

-   v0.1.0:
    -   Initial version

## Example metrics output

```sh
curl http://localhost:3000/metrics
```

```txt
# HELP emsesp_version_info EMS-ESP version
# TYPE emsesp_version_info gauge
emsesp_version_info{version="3.5.1-dev.0"} 1

# HELP emsesp_wwsettemp set temperature [C]
# TYPE emsesp_wwsettemp gauge
emsesp_wwsettemp{device_id="8",product_id="115"} 61

# HELP emsesp_wwseltemp selected temperature [C]
# TYPE emsesp_wwseltemp gauge
emsesp_wwseltemp{device_id="8",product_id="115"} 60

# HELP emsesp_wwtype type [enum]
# TYPE emsesp_wwtype gauge
emsesp_wwtype{emsesp_wwtype="off",device_id="8",product_id="115"} 0
emsesp_wwtype{emsesp_wwtype="flow",device_id="8",product_id="115"} 0
emsesp_wwtype{emsesp_wwtype="buffered flow",device_id="8",product_id="115"} 0
emsesp_wwtype{emsesp_wwtype="buffer",device_id="8",product_id="115"} 1
emsesp_wwtype{emsesp_wwtype="layered buffer",device_id="8",product_id="115"} 0

# HELP emsesp_wwcomfort comfort [enum]
# TYPE emsesp_wwcomfort gauge
emsesp_wwcomfort{emsesp_wwcomfort="hot",device_id="8",product_id="115"} 1
emsesp_wwcomfort{emsesp_wwcomfort="eco",device_id="8",product_id="115"} 0
emsesp_wwcomfort{emsesp_wwcomfort="intelligent",device_id="8",product_id="115"} 0

# HELP emsesp_wwflowtempoffset flow temperature offset [C]
# TYPE emsesp_wwflowtempoffset gauge
emsesp_wwflowtempoffset{device_id="8",product_id="115"} 20

# HELP emsesp_wwcircpump circulation pump available [boolean]
# TYPE emsesp_wwcircpump gauge
emsesp_wwcircpump{device_id="8",product_id="115"} 1

# HELP emsesp_wwchargetype charging type [enum]
# TYPE emsesp_wwchargetype gauge
emsesp_wwchargetype{emsesp_wwchargetype="chargepump",device_id="8",product_id="115"} 0
emsesp_wwchargetype{emsesp_wwchargetype="3-way valve",device_id="8",product_id="115"} 1

# HELP emsesp_wwhyston hysteresis on temperature [C]
# TYPE emsesp_wwhyston gauge
emsesp_wwhyston{device_id="8",product_id="115"} -11

# HELP emsesp_wwhystoff hysteresis off temperature [C]
# TYPE emsesp_wwhystoff gauge
emsesp_wwhystoff{device_id="8",product_id="115"} 0

# HELP emsesp_wwdisinfectiontemp disinfection temperature [C]
# TYPE emsesp_wwdisinfectiontemp gauge
emsesp_wwdisinfectiontemp{device_id="8",product_id="115"} 70

# HELP emsesp_wwcircmode circulation pump mode [enum]
# TYPE emsesp_wwcircmode gauge
emsesp_wwcircmode{emsesp_wwcircmode="1x3min",device_id="8",product_id="115"} 0
emsesp_wwcircmode{emsesp_wwcircmode="2x3min",device_id="8",product_id="115"} 1
emsesp_wwcircmode{emsesp_wwcircmode="3x3min",device_id="8",product_id="115"} 0
emsesp_wwcircmode{emsesp_wwcircmode="4x3min",device_id="8",product_id="115"} 0
emsesp_wwcircmode{emsesp_wwcircmode="5x3min",device_id="8",product_id="115"} 0
emsesp_wwcircmode{emsesp_wwcircmode="6x3min",device_id="8",product_id="115"} 0
emsesp_wwcircmode{emsesp_wwcircmode="continuous",device_id="8",product_id="115"} 0

# HELP emsesp_wwcirc circulation active [boolean]
# TYPE emsesp_wwcirc gauge
emsesp_wwcirc{device_id="8",product_id="115"} 0

# HELP emsesp_wwcurtemp current intern temperature [C]
# TYPE emsesp_wwcurtemp gauge
emsesp_wwcurtemp{device_id="8",product_id="115"} 39.1

# HELP emsesp_wwcurtemp2 current extern temperature [C]
# TYPE emsesp_wwcurtemp2 gauge
emsesp_wwcurtemp2{device_id="8",product_id="115"} 54

# HELP emsesp_wwcurflow current tap water flow [l/min]
# TYPE emsesp_wwcurflow gauge
emsesp_wwcurflow{device_id="8",product_id="115"} 0

# HELP emsesp_wwstoragetemp1 storage intern temperature [C]
# TYPE emsesp_wwstoragetemp1 gauge
emsesp_wwstoragetemp1{device_id="8",product_id="115"} 39

# HELP emsesp_wwstoragetemp2 storage extern temperature [C]
# TYPE emsesp_wwstoragetemp2 gauge
emsesp_wwstoragetemp2{device_id="8",product_id="115"} 54.1

# HELP emsesp_wwactivated activated [boolean]
# TYPE emsesp_wwactivated gauge
emsesp_wwactivated{device_id="8",product_id="115"} 1

# HELP emsesp_wwonetime one time charging [boolean]
# TYPE emsesp_wwonetime gauge
emsesp_wwonetime{device_id="8",product_id="115"} 0

# HELP emsesp_wwdisinfecting disinfecting [boolean]
# TYPE emsesp_wwdisinfecting gauge
emsesp_wwdisinfecting{device_id="8",product_id="115"} 0

# HELP emsesp_wwcharging charging [boolean]
# TYPE emsesp_wwcharging gauge
emsesp_wwcharging{device_id="8",product_id="115"} 0

# HELP emsesp_wwrecharging recharging [boolean]
# TYPE emsesp_wwrecharging gauge
emsesp_wwrecharging{device_id="8",product_id="115"} 0

# HELP emsesp_wwtempok temperature ok [boolean]
# TYPE emsesp_wwtempok gauge
emsesp_wwtempok{device_id="8",product_id="115"} 1

# HELP emsesp_wwactive active [boolean]
# TYPE emsesp_wwactive gauge
emsesp_wwactive{device_id="8",product_id="115"} 0

# HELP emsesp_ww3wayvalve 3-way valve active [boolean]
# TYPE emsesp_ww3wayvalve gauge
emsesp_ww3wayvalve{device_id="8",product_id="115"} 0

# HELP emsesp_wwstarts starts [ulong]
# TYPE emsesp_wwstarts counter
emsesp_wwstarts{device_id="8",product_id="115"} 26897

# HELP emsesp_wwworkm active time [seconds]
# TYPE emsesp_wwworkm counter
emsesp_wwworkm{device_id="8",product_id="115"} 10506240

# HELP emsesp_heatingactive heating active [boolean]
# TYPE emsesp_heatingactive gauge
emsesp_heatingactive{device_id="8",product_id="115"} 0

# HELP emsesp_tapwateractive tapwater active [boolean]
# TYPE emsesp_tapwateractive gauge
emsesp_tapwateractive{device_id="8",product_id="115"} 0

# HELP emsesp_selflowtemp selected flow temperature [C]
# TYPE emsesp_selflowtemp gauge
emsesp_selflowtemp{device_id="8",product_id="115"} 15

# HELP emsesp_heatingpumpmod heating pump modulation [%]
# TYPE emsesp_heatingpumpmod gauge
emsesp_heatingpumpmod{device_id="8",product_id="115"} 0.6

# HELP emsesp_curflowtemp current flow temperature [C]
# TYPE emsesp_curflowtemp gauge
emsesp_curflowtemp{device_id="8",product_id="115"} 21.6

# HELP emsesp_rettemp return temperature [C]
# TYPE emsesp_rettemp gauge
emsesp_rettemp{device_id="8",product_id="115"} 21.7

# HELP emsesp_switchtemp mixing switch temperature [C]
# TYPE emsesp_switchtemp gauge
emsesp_switchtemp{device_id="8",product_id="115"} 0

# HELP emsesp_syspress system pressure [bar]
# TYPE emsesp_syspress gauge
emsesp_syspress{device_id="8",product_id="115"} 1.4

# HELP emsesp_boiltemp actual boiler temperature [C]
# TYPE emsesp_boiltemp gauge
emsesp_boiltemp{device_id="8",product_id="115"} 20.2

# HELP emsesp_burngas gas [boolean]
# TYPE emsesp_burngas gauge
emsesp_burngas{device_id="8",product_id="115"} 0

# HELP emsesp_burngas2 gas stage 2 [boolean]
# TYPE emsesp_burngas2 gauge
emsesp_burngas2{device_id="8",product_id="115"} 0

# HELP emsesp_flamecurr flame current [µA]
# TYPE emsesp_flamecurr gauge
emsesp_flamecurr{device_id="8",product_id="115"} 0

# HELP emsesp_heatingpump heating pump [boolean]
# TYPE emsesp_heatingpump gauge
emsesp_heatingpump{device_id="8",product_id="115"} 1

# HELP emsesp_fanwork fan [boolean]
# TYPE emsesp_fanwork gauge
emsesp_fanwork{device_id="8",product_id="115"} 0

# HELP emsesp_ignwork ignition [boolean]
# TYPE emsesp_ignwork gauge
emsesp_ignwork{device_id="8",product_id="115"} 0

# HELP emsesp_oilpreheat oil preheating [boolean]
# TYPE emsesp_oilpreheat gauge
emsesp_oilpreheat{device_id="8",product_id="115"} 0

# HELP emsesp_heatingactivated heating activated [boolean]
# TYPE emsesp_heatingactivated gauge
emsesp_heatingactivated{device_id="8",product_id="115"} 1

# HELP emsesp_heatingtemp heating temperature [C]
# TYPE emsesp_heatingtemp gauge
emsesp_heatingtemp{device_id="8",product_id="115"} 80

# HELP emsesp_pumpmodmax boiler pump max power [%]
# TYPE emsesp_pumpmodmax gauge
emsesp_pumpmodmax{device_id="8",product_id="115"} 1

# HELP emsesp_pumpmodmin boiler pump min power [%]
# TYPE emsesp_pumpmodmin gauge
emsesp_pumpmodmin{device_id="8",product_id="115"} 0.6

# HELP emsesp_pumpmode pump mode [enum]
# TYPE emsesp_pumpmode gauge
emsesp_pumpmode{emsesp_pumpmode="proportional",device_id="8",product_id="115"} 1
emsesp_pumpmode{emsesp_pumpmode="deltaP-1",device_id="8",product_id="115"} 0
emsesp_pumpmode{emsesp_pumpmode="deltaP-2",device_id="8",product_id="115"} 0
emsesp_pumpmode{emsesp_pumpmode="deltaP-3",device_id="8",product_id="115"} 0
emsesp_pumpmode{emsesp_pumpmode="deltaP-4",device_id="8",product_id="115"} 0

# HELP emsesp_pumpdelay pump delay [minutes]
# TYPE emsesp_pumpdelay gauge
emsesp_pumpdelay{device_id="8",product_id="115"} 12

# HELP emsesp_burnminperiod burner min period [minutes]
# TYPE emsesp_burnminperiod gauge
emsesp_burnminperiod{device_id="8",product_id="115"} 10

# HELP emsesp_burnminpower burner min power [%]
# TYPE emsesp_burnminpower gauge
emsesp_burnminpower{device_id="8",product_id="115"} 0

# HELP emsesp_burnmaxpower burner max power [%]
# TYPE emsesp_burnmaxpower gauge
emsesp_burnmaxpower{device_id="8",product_id="115"} 0.8

# HELP emsesp_boilhyston hysteresis on temperature [C]
# TYPE emsesp_boilhyston gauge
emsesp_boilhyston{device_id="8",product_id="115"} -6

# HELP emsesp_boilhystoff hysteresis off temperature [C]
# TYPE emsesp_boilhystoff gauge
emsesp_boilhystoff{device_id="8",product_id="115"} 6

# HELP emsesp_selburnpow burner selected max power [%]
# TYPE emsesp_selburnpow gauge
emsesp_selburnpow{device_id="8",product_id="115"} 0.8

# HELP emsesp_curburnpow burner current power [%]
# TYPE emsesp_curburnpow gauge
emsesp_curburnpow{device_id="8",product_id="115"} 0

# HELP emsesp_burnstarts burner starts [ulong]
# TYPE emsesp_burnstarts counter
emsesp_burnstarts{device_id="8",product_id="115"} 126539

# HELP emsesp_burnworkmin total burner operating time [seconds]
# TYPE emsesp_burnworkmin counter
emsesp_burnworkmin{device_id="8",product_id="115"} 62907960

# HELP emsesp_burn2workmin burner stage 2 operating time [seconds]
# TYPE emsesp_burn2workmin counter
emsesp_burn2workmin{device_id="8",product_id="115"} 0

# HELP emsesp_heatworkmin total heat operating time [seconds]
# TYPE emsesp_heatworkmin counter
emsesp_heatworkmin{device_id="8",product_id="115"} 52401720

# HELP emsesp_heatstarts burner starts heating [ulong]
# TYPE emsesp_heatstarts counter
emsesp_heatstarts{device_id="8",product_id="115"} 99642

# HELP emsesp_ubauptime total UBA operating time [seconds]
# TYPE emsesp_ubauptime counter
emsesp_ubauptime{device_id="8",product_id="115"} 475584660

# HELP emsesp_servicecode service code [string]
# TYPE emsesp_servicecode gauge
emsesp_servicecode{emsesp_servicecode="0Y",device_id="8",product_id="115"} 1

# HELP emsesp_servicecodenumber service code number [ushort]
# TYPE emsesp_servicecodenumber gauge
emsesp_servicecodenumber{device_id="8",product_id="115"} 204

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
```

## License

MIT license.
Copyright (C) 2023 Martin Poelstra
