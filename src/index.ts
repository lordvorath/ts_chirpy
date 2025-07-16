import express from "express";
import type { Request, Response, NextFunction } from "express";
import { cfg } from "./config.js";
import { middlewareLogResponses, middlewareMetricsInc } from "./middleware.js";




async function handlerReadiness(req: Request, res: Response): Promise<void>{
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.send("OK");
}

async function handlerMetrics(req:Request, res: Response): Promise<void> {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.send(`Hits: ${cfg.fileserverHits}`);
}

async function handlerReset(req:Request, res: Response): Promise<void> {
    cfg.fileserverHits = 0;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.write("Metrics reset");
    res.end();
}

const app = express();
const PORT = 8080;

app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/healthz", handlerReadiness);
app.get("/metrics", handlerMetrics);
app.get("/reset", handlerReset);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
});