import * as path from "path";
import { Counter, Gauge, Registry } from "prom-client";
import { Api } from "./api";
import { Entities, readEntities, Value, ValueType } from "./entities";
import { buildServer } from "./server";
import { warnOnce } from "./util";

function getMetrics(values: Value[]): Registry {
    const registry = new Registry();

    for (const value of values) {
        if (!value.entity) {
            warnOnce(
                `Ignoring ${value.shortName}, missing entity configuration`
            );
            // TODO Could probably just convert it into an untyped metric instead
            continue;
        }

        const ent = value.entity;

        const metricName = `emsesp_${ent.shortName}`;
        let unit = ent.unit ?? ent.type;

        // Convert time to seconds, it's the canonical unit for Prometheus times
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
                if (ent.type === ValueType.Time) {
                    // Convert to seconds, see above
                    metricValue *= 60;
                }
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

async function main(): Promise<void> {
    const EMS_ESP_URL = process.env.EMS_ESP_URL || "http://ems-esp.local";
    const ENTITIES_CSV =
        process.env.ENTITIES_CSV || "../config/dump_entities.csv"; // https://emsesp.github.io/docs/data/dump_entities.csv
    const METRICS_PORT = process.env.METRICS_PORT || 3000;
    console.log(`EMS_ESP_URL=${EMS_ESP_URL}`);
    console.log(`ENTITIES_CSV=${ENTITIES_CSV}`);
    console.log(`METRICS_PORT=${METRICS_PORT}`);

    console.log("Reading entity definitions...");
    const entities = new Entities(
        await readEntities(path.resolve(__dirname, ENTITIES_CSV))
    );

    const api = await Api.create(EMS_ESP_URL);
    const device = api.system.devices[0];

    const server = buildServer(async () => {
        const rawValues = await api.getRawValues(device.type);
        const values = entities.parseValues(device.productId, rawValues);
        // Rebuilding the registry (metrics) isn't the most efficient,
        // but it is simple and robust (e.g. parallel scrapes, disappearing metrics,
        // etc)
        return getMetrics(values);
    });
    server.listen(METRICS_PORT);
    console.log(
        `Server listening, metrics exposed on http://localhost:${METRICS_PORT}/metrics`
    );
}

main().catch((err) => {
    console.error("FATAL", err);
    process.exit(1);
});
