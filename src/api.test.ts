import { expect, it } from "@jest/globals";
import { getExampleSystem_3_5, getExampleSystem_3_7 } from "./test/examples";

it("parses system info v3.5", async () => {
    expect(getExampleSystem_3_5()).toMatchSnapshot();
});

it("parses system info v3.7", async () => {
    expect(await getExampleSystem_3_7()).toMatchSnapshot();
});
