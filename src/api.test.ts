import { expect, it } from "@jest/globals";
import { getExampleSystem } from "./test/examples";

it("parses original system info", async () => {
    expect(getExampleSystem()).toMatchSnapshot();
});
