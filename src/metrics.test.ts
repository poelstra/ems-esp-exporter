import { expect, it } from "@jest/globals";
import { Registry } from "prom-client";
import { DeviceType } from "./common";
import { addDeviceMetrics, addSystemMetrics, getMetrics } from "./metrics";
import {
    getExampleDeviceValues_3_5,
    getExampleDeviceValues_3_7,
    getExampleScrapedValues,
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
    addDeviceMetrics(registry, {
        type: DeviceType.Boiler,
        deviceId: 0x08,
        productId: 115,
        values: await getExampleDeviceValues_3_5(),
    });
    expect(await registry.metrics()).toMatchSnapshot();
});

it("handles system metrics v3.7", async () => {
    const registry = new Registry();
    addSystemMetrics(registry, await getExampleSystem_3_7());
    expect(await registry.metrics()).toMatchSnapshot();
});

it("handles device metrics v3.7", async () => {
    const registry = new Registry();
    // Build metrics using dump_entities.csv and /values response
    addDeviceMetrics(registry, {
        type: DeviceType.Boiler,
        deviceId: 0x08,
        productId: 115,
        values: await getExampleDeviceValues_3_7(),
    });
    expect(await registry.metrics()).toMatchSnapshot();
});

it("handles entity-based metrics v3.7", async () => {
    const registry = getMetrics(await getExampleScrapedValues("example-37"));
    expect(await registry.metrics()).toMatchSnapshot();
});

it("handles boiler and thermostat metrics having overlapping entities", async () => {
    const registry = getMetrics(await getExampleScrapedValues("mihok-en"));
    expect(await registry.metrics()).toMatchSnapshot();
});

it("handles localized entities response", async () => {
    const registry = getMetrics(await getExampleScrapedValues("mihok-sk"));
    expect(await registry.metrics()).toMatchSnapshot();
});
