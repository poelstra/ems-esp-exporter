import * as express from "express";
import { Express } from "express";
import { Registry } from "prom-client";

export function buildServer(getMetrics: () => Promise<Registry>): Express {
    const server = express();
    server.get("/metrics", async (req, res) => {
        try {
            const registry = await getMetrics();
            res.set("Content-Type", registry.contentType);
            res.end(await registry.metrics());
        } catch (ex) {
            res.status(500).end(ex);
        }
    });

    return server;
}
