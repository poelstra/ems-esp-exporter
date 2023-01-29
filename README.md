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
-   Run `npm build` to build (or press `Ctrl+Shift+B` in VSCode to start the watch task)
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
# HELP emsesp_wwsettemp set temperature [C]
# TYPE emsesp_wwsettemp gauge
emsesp_wwsettemp 61

# HELP emsesp_wwseltemp selected temperature [C]
# TYPE emsesp_wwseltemp gauge
emsesp_wwseltemp 60

# HELP emsesp_wwtype type [enum]
# TYPE emsesp_wwtype gauge
emsesp_wwtype{emsesp_wwtype="off"} 0
emsesp_wwtype{emsesp_wwtype="flow"} 0
emsesp_wwtype{emsesp_wwtype="buffered flow"} 0
emsesp_wwtype{emsesp_wwtype="buffer"} 1
emsesp_wwtype{emsesp_wwtype="layered buffer"} 0

# HELP emsesp_wwcomfort comfort [enum]
# TYPE emsesp_wwcomfort gauge
emsesp_wwcomfort{emsesp_wwcomfort="hot"} 1
emsesp_wwcomfort{emsesp_wwcomfort="eco"} 0
emsesp_wwcomfort{emsesp_wwcomfort="intelligent"} 0

# HELP emsesp_wwflowtempoffset flow temperature offset [C]
# TYPE emsesp_wwflowtempoffset gauge
emsesp_wwflowtempoffset 20

# HELP emsesp_wwcircpump circulation pump available [boolean]
# TYPE emsesp_wwcircpump gauge
emsesp_wwcircpump 1

# HELP emsesp_wwchargetype charging type [enum]
# TYPE emsesp_wwchargetype gauge
emsesp_wwchargetype{emsesp_wwchargetype="chargepump"} 0
emsesp_wwchargetype{emsesp_wwchargetype="3-way valve"} 1

# HELP emsesp_wwhyston hysteresis on temperature [C]
# TYPE emsesp_wwhyston gauge
emsesp_wwhyston -11

# HELP emsesp_wwhystoff hysteresis off temperature [C]
# TYPE emsesp_wwhystoff gauge
emsesp_wwhystoff 0

# HELP emsesp_wwdisinfectiontemp disinfection temperature [C]
# TYPE emsesp_wwdisinfectiontemp gauge
emsesp_wwdisinfectiontemp 70

# HELP emsesp_wwcircmode circulation pump mode [enum]
# TYPE emsesp_wwcircmode gauge
emsesp_wwcircmode{emsesp_wwcircmode="1x3min"} 0
emsesp_wwcircmode{emsesp_wwcircmode="2x3min"} 1
emsesp_wwcircmode{emsesp_wwcircmode="3x3min"} 0
emsesp_wwcircmode{emsesp_wwcircmode="4x3min"} 0
emsesp_wwcircmode{emsesp_wwcircmode="5x3min"} 0
emsesp_wwcircmode{emsesp_wwcircmode="6x3min"} 0
emsesp_wwcircmode{emsesp_wwcircmode="continuous"} 0

# HELP emsesp_wwcirc circulation active [boolean]
# TYPE emsesp_wwcirc gauge
emsesp_wwcirc 0

# HELP emsesp_wwcurtemp current intern temperature [C]
# TYPE emsesp_wwcurtemp gauge
emsesp_wwcurtemp 40.5

# HELP emsesp_wwcurtemp2 current extern temperature [C]
# TYPE emsesp_wwcurtemp2 gauge
emsesp_wwcurtemp2 53.7

# HELP emsesp_wwcurflow current tap water flow [l/min]
# TYPE emsesp_wwcurflow gauge
emsesp_wwcurflow 0

# HELP emsesp_wwstoragetemp1 storage intern temperature [C]
# TYPE emsesp_wwstoragetemp1 gauge
emsesp_wwstoragetemp1 40.5

# HELP emsesp_wwstoragetemp2 storage extern temperature [C]
# TYPE emsesp_wwstoragetemp2 gauge
emsesp_wwstoragetemp2 53.7

# HELP emsesp_wwactivated activated [boolean]
# TYPE emsesp_wwactivated gauge
emsesp_wwactivated 1

# HELP emsesp_wwonetime one time charging [boolean]
# TYPE emsesp_wwonetime gauge
emsesp_wwonetime 0

# HELP emsesp_wwdisinfecting disinfecting [boolean]
# TYPE emsesp_wwdisinfecting gauge
emsesp_wwdisinfecting 0

# HELP emsesp_wwcharging charging [boolean]
# TYPE emsesp_wwcharging gauge
emsesp_wwcharging 0

# HELP emsesp_wwrecharging recharging [boolean]
# TYPE emsesp_wwrecharging gauge
emsesp_wwrecharging 0

# HELP emsesp_wwtempok temperature ok [boolean]
# TYPE emsesp_wwtempok gauge
emsesp_wwtempok 1

# HELP emsesp_wwactive active [boolean]
# TYPE emsesp_wwactive gauge
emsesp_wwactive 0

# HELP emsesp_ww3wayvalve 3-way valve active [boolean]
# TYPE emsesp_ww3wayvalve gauge
emsesp_ww3wayvalve 0

# HELP emsesp_wwstarts starts [ulong]
# TYPE emsesp_wwstarts counter
emsesp_wwstarts 26850

# HELP emsesp_wwworkm active time [seconds]
# TYPE emsesp_wwworkm counter
emsesp_wwworkm 10480860

# HELP emsesp_heatingactive heating active [boolean]
# TYPE emsesp_heatingactive gauge
emsesp_heatingactive 0

# HELP emsesp_tapwateractive tapwater active [boolean]
# TYPE emsesp_tapwateractive gauge
emsesp_tapwateractive 0

# HELP emsesp_selflowtemp selected flow temperature [C]
# TYPE emsesp_selflowtemp gauge
emsesp_selflowtemp 7

# HELP emsesp_selburnpow burner selected max power [%]
# TYPE emsesp_selburnpow gauge
emsesp_selburnpow 0

# HELP emsesp_heatingpumpmod heating pump modulation [%]
# TYPE emsesp_heatingpumpmod gauge
emsesp_heatingpumpmod 0.7

# HELP emsesp_curflowtemp current flow temperature [C]
# TYPE emsesp_curflowtemp gauge
emsesp_curflowtemp 35.8

# HELP emsesp_rettemp return temperature [C]
# TYPE emsesp_rettemp gauge
emsesp_rettemp 35

# HELP emsesp_switchtemp mixing switch temperature [C]
# TYPE emsesp_switchtemp gauge
emsesp_switchtemp 0

# HELP emsesp_syspress system pressure [bar]
# TYPE emsesp_syspress gauge
emsesp_syspress 1.6

# HELP emsesp_boiltemp actual boiler temperature [C]
# TYPE emsesp_boiltemp gauge
emsesp_boiltemp 36.2

# HELP emsesp_burngas gas [boolean]
# TYPE emsesp_burngas gauge
emsesp_burngas 0

# HELP emsesp_burngas2 gas stage 2 [boolean]
# TYPE emsesp_burngas2 gauge
emsesp_burngas2 0

# HELP emsesp_flamecurr flame current [µA]
# TYPE emsesp_flamecurr gauge
emsesp_flamecurr 0

# HELP emsesp_heatingpump heating pump [boolean]
# TYPE emsesp_heatingpump gauge
emsesp_heatingpump 1

# HELP emsesp_fanwork fan [boolean]
# TYPE emsesp_fanwork gauge
emsesp_fanwork 0

# HELP emsesp_ignwork ignition [boolean]
# TYPE emsesp_ignwork gauge
emsesp_ignwork 0

# HELP emsesp_oilpreheat oil preheating [boolean]
# TYPE emsesp_oilpreheat gauge
emsesp_oilpreheat 0

# HELP emsesp_heatingactivated heating activated [boolean]
# TYPE emsesp_heatingactivated gauge
emsesp_heatingactivated 1

# HELP emsesp_heatingtemp heating temperature [C]
# TYPE emsesp_heatingtemp gauge
emsesp_heatingtemp 80

# HELP emsesp_pumpmodmax boiler pump max power [%]
# TYPE emsesp_pumpmodmax gauge
emsesp_pumpmodmax 1

# HELP emsesp_pumpmodmin boiler pump min power [%]
# TYPE emsesp_pumpmodmin gauge
emsesp_pumpmodmin 0.7

# HELP emsesp_pumpdelay pump delay [minutes]
# TYPE emsesp_pumpdelay gauge
emsesp_pumpdelay 12

# HELP emsesp_burnminperiod burner min period [minutes]
# TYPE emsesp_burnminperiod gauge
emsesp_burnminperiod 10

# HELP emsesp_burnminpower burner min power [%]
# TYPE emsesp_burnminpower gauge
emsesp_burnminpower 0

# HELP emsesp_burnmaxpower burner max power [%]
# TYPE emsesp_burnmaxpower gauge
emsesp_burnmaxpower 0.8

# HELP emsesp_boilhyston hysteresis on temperature [C]
# TYPE emsesp_boilhyston gauge
emsesp_boilhyston -6

# HELP emsesp_boilhystoff hysteresis off temperature [C]
# TYPE emsesp_boilhystoff gauge
emsesp_boilhystoff 6

# HELP emsesp_curburnpow burner current power [%]
# TYPE emsesp_curburnpow gauge
emsesp_curburnpow 0

# HELP emsesp_burnstarts burner starts [ulong]
# TYPE emsesp_burnstarts counter
emsesp_burnstarts 125903

# HELP emsesp_burnworkmin total burner operating time [seconds]
# TYPE emsesp_burnworkmin counter
emsesp_burnworkmin 62513580

# HELP emsesp_burn2workmin burner stage 2 operating time [seconds]
# TYPE emsesp_burn2workmin counter
emsesp_burn2workmin 0

# HELP emsesp_heatworkmin total heat operating time [seconds]
# TYPE emsesp_heatworkmin counter
emsesp_heatworkmin 52032720

# HELP emsesp_ubauptime total UBA operating time [seconds]
# TYPE emsesp_ubauptime counter
emsesp_ubauptime 474311220

# HELP emsesp_servicecodenumber service code number [ushort]
# TYPE emsesp_servicecodenumber gauge
emsesp_servicecodenumber 203
```

## License

MIT license.
Copyright (C) 2023 Martin Poelstra
