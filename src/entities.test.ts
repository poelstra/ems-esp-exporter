import { expect, it } from "@jest/globals";
import * as path from "path";
import { Entities, Entity, readEntities } from "./entities";

const ENTITIES_CSV_PATH = "../config/dump_entities.csv";
const ENTITIES_CSV_ORIGINAL_PATH = "../config/dump_entities.csv.20230128";

async function getParsedEntities(
    csv_path: string = ENTITIES_CSV_PATH,
): Promise<Entity[]> {
    const entitiesPath = path.resolve(__dirname, csv_path);
    return readEntities(entitiesPath);
}

it("parses original entities dump", async () => {
    // Initial import of dump_entities.csv, using less columns
    // and different value type names.
    expect(
        await getParsedEntities(ENTITIES_CSV_ORIGINAL_PATH),
    ).toMatchSnapshot();
});

it("parses bundled entities dump", async () => {
    expect(await getParsedEntities()).toMatchSnapshot();
});

it("parses original raw values into canonical form", async () => {
    const entities = new Entities(
        await getParsedEntities(ENTITIES_CSV_ORIGINAL_PATH),
    );
    expect(
        entities.parseValues(115, JSON.parse(EXAMPLE_DEVICE_ORIGINAL_RESPONSE)),
    ).toMatchSnapshot();
});

const EXAMPLE_DEVICE_ORIGINAL_RESPONSE = `{
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
