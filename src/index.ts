import * as path from "path";
import { Api } from "./api";
import { Entities, readEntities } from "./entities";
import { getMetrics } from "./metrics";
import { buildServer } from "./server";
import { runMain } from "./util";

async function main(): Promise<void> {
    const EMS_ESP_URL = process.env.EMS_ESP_URL || "http://ems-esp.local";
    const ENTITIES_CSV =
        process.env.ENTITIES_CSV || "../config/dump_entities.csv"; // https://emsesp.github.io/docs/data/dump_entities.csv
    const METRICS_PORT = process.env.METRICS_PORT || 3000;

    console.log("Environment configuration:");
    console.log(`EMS_ESP_URL=${EMS_ESP_URL}`);
    console.log(`ENTITIES_CSV=${ENTITIES_CSV}`);
    console.log(`METRICS_PORT=${METRICS_PORT}`);
    console.log("");

    const entitiesPath = path.resolve(__dirname, ENTITIES_CSV);
    console.log(`Loading entity definitions from ${entitiesPath} ...`);
    const entities = new Entities(await readEntities(entitiesPath));

    console.log("Retrieving devices from EMS-ESP...");
    const api = await Api.create(EMS_ESP_URL);
    const device = api.system.devices[0];

    const server = buildServer(async () => {
        const rawValues = await api.getRawValues(device.type);
        const values = entities.parseValues(device.productId, rawValues);
        return getMetrics(values);
    });

    server.listen(METRICS_PORT);
    console.log(
        `Server listening, metrics exposed on http://localhost:${METRICS_PORT}/metrics`
    );
}

runMain(main);
