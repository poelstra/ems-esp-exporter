import { expect, it } from "@jest/globals";
import {
    ENTITIES_CSV_3_5_PATH,
    ENTITIES_CSV_3_7_PATH,
    getExampleDeviceValues_3_5,
    getParsedEntities,
} from "./test/examples";

it("parses entities dump v3.5", async () => {
    // Initial import of dump_entities.csv, using less columns
    // and different value type names.
    expect(await getParsedEntities(ENTITIES_CSV_3_5_PATH)).toMatchSnapshot();
});

it("parses entities dump v3.7", async () => {
    expect(await getParsedEntities(ENTITIES_CSV_3_7_PATH)).toMatchSnapshot();
});

it("parses bundled entities dump", async () => {
    expect(await getParsedEntities()).toMatchSnapshot();
});

it("parses raw values v3.5 into canonical form", async () => {
    expect(await getExampleDeviceValues_3_5()).toMatchSnapshot();
});
