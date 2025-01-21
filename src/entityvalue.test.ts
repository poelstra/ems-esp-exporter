import { expect, it } from "@jest/globals";
import { getExampleEntityValues_3_7 } from "./test/examples";

it("should parse entity values v3.7", () => {
    expect(getExampleEntityValues_3_7()).toMatchSnapshot();
});
