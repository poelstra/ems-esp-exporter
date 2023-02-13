import { Counter, Gauge, Registry } from "prom-client";
import { Api, System } from "./api";
import { Entities, Value, ValueType } from "./entities";
import { warnOnce } from "./util";

export function buildGetMetrics(
    api: Api,
    entities: Entities
): () => Promise<Registry> {
    return async () => {
        // Rebuilding the registry (metrics) isn't the most efficient,
        // but it is simple and robust (e.g. parallel scrapes, disappearing metrics,
        // etc)
        const registry = new Registry();

        const system = await api.getSystem();
        addSystemMetrics(registry, system);

        const device = system.devices[0];
        const rawDeviceValues = await api.getRawValues(device.type);
        const values = entities.parseValues(device.productId, rawDeviceValues);
        addDeviceMetrics(registry, values);

        return registry;
    };
}

export function addSystemMetrics(register: Registry, system: System): void {
    const versionGauge = new Gauge({
        name: "emsesp_version_info",
        help: "EMS-ESP version",
        labelNames: ["version"],
        registers: [register],
    });
    versionGauge.set({ version: system.systemInfo.version }, 1);
}

export function addDeviceMetrics(registry: Registry, values: Value[]): void {
    for (const value of values) {
        if (!value.entity) {
            warnOnce(
                `Ignoring ${value.shortName}, missing entity configuration`
            );
            // TODO Could probably just convert it into an untyped metric instead,
            // if it happens to be numeric
            continue;
        }

        const ent = value.entity;

        const metricName = `emsesp_${ent.shortName}`;
        let unit = ent.unit ?? ent.type;

        // Convert time to seconds, it's the canonical unit for Prometheus times
        // See e.g. https://prometheus.io/docs/practices/naming/#base-units
        if (ent.type === ValueType.Time) {
            unit = "seconds";
        }

        const metricHelp = [ent.fullName, unit && `[${unit}]`]
            .filter((part) => !!part)
            .join(" ");

        let metricValue: number;
        switch (ent.type) {
            case ValueType.Int:
            case ValueType.Short:
            case ValueType.UInt:
            case ValueType.ULong:
            case ValueType.UShort:
            case ValueType.Time:
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
                            { [metricName]: lit },
                            value.value === lit ? 1 : 0
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
                    gauge.set({ [metricName]: `${value.value}` }, 1);
                    continue;
                }
                break;
            default:
                warnOnce(
                    `Ignoring '${value.shortName}', unsupported type '${ent.type}' (value '${value.value}')`
                );
                continue;
        }

        // Convert values to canonical units, as typically expected
        // by Prometheus
        if (ent.type === ValueType.Time) {
            // Convert to seconds
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
                registers: [registry],
            });
            counter.inc(metricValue);
        } else {
            const gauge = new Gauge({
                name: metricName,
                help: metricHelp,
                registers: [registry],
            });
            gauge.set(metricValue);
        }
    }
}
