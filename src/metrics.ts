import { Counter, Gauge, Registry } from "prom-client";
import { Api, System } from "./api";
import { DeviceType, Value, ValueType } from "./common";
import { Entities } from "./entities";
import { parseEntityValues } from "./entityvalue";
import { warnOnce } from "./util";

export interface ScrapedValues {
    system: System;
    devices: ScrapedDevice[];
}

export interface ScrapedDevice {
    type: DeviceType;
    deviceId: number; // e.g. 8
    productId: number; // e.g. 115
    values: Value[];
}

export async function scrapeValues(
    api: Api,
    entities: Entities,
): Promise<ScrapedValues> {
    const system = await api.getSystem();
    const devices: ScrapedDevice[] = [];

    const seen: Set<DeviceType> = new Set();
    for (const device of system.devices) {
        if (device.entities === 0) {
            // Skip devices without entities like the controller.
            // It throws an error when trying to access their API.
            continue;
        }

        if (seen.has(device.type)) {
            // When a device of the same type is already seen, skip it.
            // Its entities will already have been processed as additional
            // circuits (e.g. hc1, hc2).
            continue;
        }
        seen.add(device.type);

        let values: Value[];
        if (supportsEntityValues(system.systemInfo.version)) {
            const rawValues = await api.getEntityValues(device.type);
            values = parseEntityValues(rawValues);
        } else {
            const rawValues = await api.getRawValues(device.type);
            values = entities.parseValues(
                device.type,
                device.productId,
                rawValues,
            );
        }
        devices.push({
            type: device.type,
            deviceId: device.deviceId,
            productId: device.productId,
            values,
        });
    }

    return { system, devices };
}

export function getMetrics(values: ScrapedValues): Registry {
    // Rebuilding the registry (metrics) isn't the most efficient,
    // but it is simple and robust (e.g. parallel scrapes, disappearing metrics,
    // etc)
    const registry = new Registry();

    addSystemMetrics(registry, values.system);

    for (const device of values.devices) {
        addDeviceMetrics(registry, device);
    }
    return registry;
}

export function supportsEntityValues(version: string): boolean {
    const [major, minor] = version.split(".").map(Number);
    return major > 3 || (major === 3 && minor >= 7);
}

export function addSystemMetrics(register: Registry, system: System): void {
    const versionGauge = new Gauge({
        name: "emsesp_system_version",
        help: "EMS-ESP version",
        labelNames: ["emsesp_system_version"],
        registers: [register],
    });
    versionGauge.set({ emsesp_system_version: system.systemInfo.version }, 1);
}

export function addDeviceMetrics(
    registry: Registry,
    device: ScrapedDevice,
): void {
    for (const value of device.values) {
        if (!value.entity) {
            warnOnce(
                `Ignoring ${value.shortName}, missing entity configuration`,
            );
            continue;
        }

        if (value.value === undefined) {
            // Skip metrics without a value, as there are quite a few of them,
            // and they'll then waste storage space
            continue;
        }

        const ent = value.entity;

        // Metric name has to include device type, as some entities have
        // the same name but different definitions for e.g. a boiler vs
        // thermostat.
        const metricName = `emsesp_${device.type}_${value.shortName.replace(/\./g, "_")}`;
        let unit = ent.unit ?? ent.type;

        // Convert time to seconds, it's the canonical unit for Prometheus times
        // See e.g. https://prometheus.io/docs/practices/naming/#base-units
        if (ent.unit === "minutes") {
            // Note: conversion performed below
            unit = "seconds";
        }

        const metricHelp = [ent.fullName, unit && `[${unit}]`]
            .filter((part) => !!part)
            .join(" ");

        let metricValue: number;
        switch (ent.type) {
            case ValueType.Number:
                metricValue =
                    typeof value.value === "number"
                        ? value.value
                        : parseFloat(String(value.value));
                break;
            case ValueType.Boolean:
                metricValue = value.value ? 1 : 0;
                break;
            case ValueType.Enum:
                {
                    const gauge = new Gauge({
                        name: metricName,
                        help: metricHelp,
                        registers: [registry],
                        labelNames: [metricName],
                    });
                    // Create a metric for each literal, and set the currently
                    // active one to 1, rest to 0
                    for (const lit of ent.literals!) {
                        gauge.set(
                            {
                                [metricName]: lit,
                            },
                            value.value === lit ? 1 : 0,
                        );
                    }
                    continue;
                }
                break;
            case ValueType.String:
                {
                    // Convert String into the same kind of metric as an enum,
                    // but in this case only output the current string value
                    const gauge = new Gauge({
                        name: metricName,
                        help: metricHelp,
                        registers: [registry],
                        labelNames: [metricName],
                    });
                    gauge.set(
                        {
                            [metricName]: `${value.value}`,
                        },
                        1,
                    );
                    continue;
                }
                break;
            case ValueType.Command:
                // Set-only value, ignore
                continue;
            default:
                // In case new values are added to the enumerations
                warnOnce(
                    `Ignoring '${value.shortName}', unsupported type '${ent.type}' (value '${value.value}')`,
                );
                continue;
        }

        // Convert values to canonical units, as typically expected
        // by Prometheus
        if (ent.unit === "minutes") {
            // Convert to seconds
            // Note: unit already converted, above
            metricValue *= 60;
        }
        if (ent.unit === "%") {
            // Convert percentage to ratio
            metricValue /= 100;
        }

        if (ent.counter) {
            const counter = new Counter({
                name: metricName,
                help: metricHelp,
                labelNames: [],
                registers: [registry],
            });
            counter.inc(metricValue);
        } else {
            const gauge = new Gauge({
                name: metricName,
                help: metricHelp,
                labelNames: [],
                registers: [registry],
            });
            gauge.set(metricValue);
        }
    }
}
