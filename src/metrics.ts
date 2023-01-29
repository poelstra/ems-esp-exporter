import { Counter, Gauge, Registry } from "prom-client";
import { Value, ValueType } from "./entities";
import { warnOnce } from "./util";

export function getMetrics(values: Value[]): Registry {
    // Rebuilding the registry (metrics) isn't the most efficient,
    // but it is simple and robust (e.g. parallel scrapes, disappearing metrics,
    // etc)
    const registry = new Registry();

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

    return registry;
}
