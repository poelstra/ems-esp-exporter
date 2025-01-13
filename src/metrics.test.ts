import { expect, it } from "@jest/globals";
import { Registry } from "prom-client";
import { addSystemMetrics } from "./metrics";
import { getExampleSystem } from "./test/examples";

it("handles system metrics", async () => {
    const registry = new Registry();
    addSystemMetrics(registry, getExampleSystem());
    expect(await registry.metrics()).toMatchSnapshot();
});
