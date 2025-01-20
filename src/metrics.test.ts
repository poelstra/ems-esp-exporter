import { expect, it } from "@jest/globals";
import { Registry } from "prom-client";
import { addDeviceMetrics, addSystemMetrics } from "./metrics";
import {
    getExampleDeviceValues_3_5,
    getExampleSystem_3_5,
} from "./test/examples";

it("handles system metrics v3.5", async () => {
    const registry = new Registry();
    addSystemMetrics(registry, getExampleSystem_3_5());
    expect(await registry.metrics()).toMatchSnapshot();
});

it("handles device metrics v3.5", async () => {
    const registry = new Registry();
    addDeviceMetrics(registry, await getExampleDeviceValues_3_5(), 8, 115);
    expect(await registry.metrics()).toMatchSnapshot();
});
