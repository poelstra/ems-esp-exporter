import { expect, it } from "@jest/globals";
import { Registry } from "prom-client";
import { addDeviceMetrics, addSystemMetrics } from "./metrics";
import {
    getExampleDeviceValues_3_5,
    getExampleDeviceValues_3_7,
    getExampleEntityValues_3_7,
    getExampleSystem_3_5,
    getExampleSystem_3_7,
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

it("handles system metrics v3.7", async () => {
    const registry = new Registry();
    addSystemMetrics(registry, getExampleSystem_3_7());
    expect(await registry.metrics()).toMatchSnapshot();
});

it("handles device metrics v3.7", async () => {
    const registry = new Registry();
    // Build metrics using dump_entities.csv and /values response
    addDeviceMetrics(registry, await getExampleDeviceValues_3_7(), 8, 115);
    expect(await registry.metrics()).toMatchSnapshot();
});

it("handles device entity value metrics v3.7", async () => {
    const registry = new Registry();
    // Build metrics from /entities response directly
    addDeviceMetrics(registry, getExampleEntityValues_3_7(), 8, 115);
    expect(await registry.metrics()).toMatchSnapshot();
});
