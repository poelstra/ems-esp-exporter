import "dotenv/config";

import * as path from "path";
import "source-map-support/register";
import { Api } from "./api";
import { Entities, readEntities } from "./entities";
import { getMetrics } from "./metrics";
import { buildServer } from "./server";
import { runMain } from "./util";

async function main(): Promise<void> {
    const EMS_ESP_URL = process.env.EMS_ESP_URL || "http://ems-esp.local";
    const ENTITIES_CSV =
        process.env.ENTITIES_CSV || "../config/dump_entities.csv"; // https://docs.emsesp.org/data/dump_entities.csv
    const METRICS_PORT = process.env.METRICS_PORT || 3000;

    console.log("Environment configuration:");
    console.log(`EMS_ESP_URL=${EMS_ESP_URL}`);
    console.log(`ENTITIES_CSV=${ENTITIES_CSV}`);
    console.log(`METRICS_PORT=${METRICS_PORT}`);
    console.log("");

    const entitiesPath = path.resolve(__dirname, ENTITIES_CSV);
    console.log(`Loading entity definitions from ${entitiesPath} ...`);
    const parsedEntities = await readEntities(entitiesPath);
    // writeFile("entities.json", JSON.stringify(parsedEntities, undefined, "\t"));
    const entities = new Entities(parsedEntities);

    console.log("Retrieving devices from EMS-ESP...");
    const api = new Api(EMS_ESP_URL);

    const server = buildServer(() => getMetrics(api, entities));

    server.listen(METRICS_PORT);
    console.log(
        `Server listening, metrics exposed on http://localhost:${METRICS_PORT}/metrics`,
    );
}

runMain(main);
