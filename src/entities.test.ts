import { expect, it } from "@jest/globals";
import {
    ENTITIES_CSV_ORIGINAL_PATH,
    getExampleDeviceValues,
    getParsedEntities,
} from "./test/examples";

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
    expect(await getExampleDeviceValues()).toMatchSnapshot();
});
