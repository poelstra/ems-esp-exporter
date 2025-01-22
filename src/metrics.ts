import { Counter, Gauge, Registry } from "prom-client";
import { Api, System } from "./api";
import { DeviceType, Value, ValueType } from "./common";
import { Entities } from "./entities";
import { parseEntityValues } from "./entityvalue";
import { warnOnce } from "./util";

export async function getMetrics(
    api: Api,
    entities: Entities,
): Promise<Registry> {
    // Rebuilding the registry (metrics) isn't the most efficient,
    // but it is simple and robust (e.g. parallel scrapes, disappearing metrics,
    // etc)
    const registry = new Registry();

    const system = await api.getSystem();
    addSystemMetrics(registry, system);

    const seen: Set<DeviceType> = new Set();
    for (const device of system.devices) {
        if (device.entities === 0) {
            // Skip devices without entities like the controller.
            // It throws an error when trying to access their API.
            continue;
        }

        // TODO This 'seen' logic is just to prevent weird stuff
        // when someone has multiple devices of the same type, as
        // I don't yet know how these would be handled...
        if (seen.has(device.type)) {
            warnOnce(
                `TODO: Cannot handle multiple devices of the same type yet. Please file an issue and attach output of /api/system and the relevant devices.`,
            );
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
        addDeviceMetrics(registry, values, device.deviceId, device.productId);
    }

    return registry;
}

export function supportsEntityValues(version: string): boolean {
    const [major, minor] = version.split(".").map(Number);
    return major > 3 || (major === 3 && minor >= 7);
}

export function addSystemMetrics(register: Registry, system: System): void {
    const versionGauge = new Gauge({
        name: "emsesp_version",
        help: "EMS-ESP version",
        labelNames: ["emsesp_version"],
        registers: [register],
    });
    versionGauge.set({ emsesp_version: system.systemInfo.version }, 1);
}

export function addDeviceMetrics(
    registry: Registry,
    values: Value[],
    deviceId: number,
    productId: number,
): void {
    for (const value of values) {
        if (!value.entity) {
            warnOnce(
                `Ignoring ${value.shortName}, missing entity configuration`,
            );
            // TODO Could probably just convert it into an untyped metric instead,
            // if it happens to be numeric
            continue;
        }

        const ent = value.entity;

        const metricName = `emsesp_${value.shortName.replace(/\./g, "_")}`;
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
                        labelNames: [metricName, "device_id", "product_id"],
                    });
                    // Create a metric for each literal, and set the currently
                    // active one to 1, rest to 0
                    for (const lit of ent.literals!) {
                        gauge.set(
                            {
                                [metricName]: lit,
                                device_id: deviceId,
                                product_id: productId,
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
                        labelNames: [metricName, "device_id", "product_id"],
                    });
                    gauge.set(
                        {
                            [metricName]: `${value.value}`,
                            device_id: deviceId,
                            product_id: productId,
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

        // TODO Support multiple instances (e.g. heat circuits?)
        if (ent.counter) {
            const counter = new Counter({
                name: metricName,
                help: metricHelp,
                labelNames: ["device_id", "product_id"],
                registers: [registry],
            });
            counter.inc(
                { device_id: deviceId, product_id: productId },
                metricValue,
            );
        } else {
            const gauge = new Gauge({
                name: metricName,
                help: metricHelp,
                labelNames: ["device_id", "product_id"],
                registers: [registry],
            });
            gauge.set(
                { device_id: deviceId, product_id: productId },
                metricValue,
            );
        }
    }
}
