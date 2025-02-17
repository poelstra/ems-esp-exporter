import "dotenv/config";

import * as path from "path";
import "source-map-support/register";
import { Api } from "./api";
import { Entities, readEntities } from "./entities";
import { getMetrics, scrapeValues } from "./metrics";
import { buildServer } from "./server";
import { runMain } from "./util";

async function main(): Promise<void> {
    const EMS_ESP_URL = process.env.EMS_ESP_URL || "http://ems-esp.local";
    const ENTITIES_CSV =
        process.env.ENTITIES_CSV || "../config/dump_entities.csv"; // https://docs.emsesp.org/data/dump_entities.csv
    const METRICS_PORT = process.env.METRICS_PORT || 3000;
    const EMS_ESP_INSTANCE = process.env.EMS_INSTANCE || "";

    const { version } = require("../package.json");
    console.log(`Version: ${version}`);
    console.log("Environment configuration:");
    console.log(`EMS_ESP_URL=${EMS_ESP_URL}`);
    console.log(`ENTITIES_CSV=${ENTITIES_CSV}`);
    console.log(`METRICS_PORT=${METRICS_PORT}`);
    console.log(`EMS_ESP_INSTANCE=${EMS_ESP_INSTANCE}`);
    console.log("");

    const entitiesPath = path.resolve(__dirname, ENTITIES_CSV);
    console.log(`Loading entity definitions from ${entitiesPath} ...`);
    const parsedEntities = await readEntities(entitiesPath);
    const entities = new Entities(parsedEntities);

    const api = new Api(EMS_ESP_URL);
    const server = buildServer(async () => {
        const registry = getMetrics(await scrapeValues(api, entities));
        if (EMS_ESP_INSTANCE) {
            registry.setDefaultLabels({ emsesp_instance: EMS_ESP_INSTANCE });
        }
        return registry;
    });

    server.listen(METRICS_PORT);
    console.log(
        `Server listening, metrics exposed on http://localhost:${METRICS_PORT}/metrics`,
    );
}

runMain(main);
