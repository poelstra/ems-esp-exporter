import { expect, it } from "@jest/globals";
import { getExampleSystem_3_5 } from "./test/examples";

it("parses original system info", async () => {
    expect(getExampleSystem_3_5()).toMatchSnapshot();
});
