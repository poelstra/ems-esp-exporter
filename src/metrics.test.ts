import { expect, it } from "@jest/globals";
import { Registry } from "prom-client";
import { addDeviceMetrics, addSystemMetrics } from "./metrics";
import { getExampleDeviceValues, getExampleSystem } from "./test/examples";

it("handles system metrics", async () => {
    const registry = new Registry();
    addSystemMetrics(registry, getExampleSystem());
    expect(await registry.metrics()).toMatchSnapshot();
});

it("handles original device metrics", async () => {
    const registry = new Registry();
    addDeviceMetrics(registry, await getExampleDeviceValues(), 8, 115);
    expect(await registry.metrics()).toMatchSnapshot();
});
