import express from "express";
import { STATUS_CODES } from "http";
import path from "path";

function middlewareLogResponses(req: express.Request, res: express.Response, next: express.NextFunction): void {
    res.on("finish", () => {
        if (res.statusCode >= 300) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${res.statusCode}`);
        }
    });
    next();
}

async function handlerReadiness(req: express.Request, res: express.Response): Promise<void>{
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.send("OK");
}

const app = express();
const PORT = 8080;

app.use(middlewareLogResponses);
app.use("/app", express.static("./src/app"));

app.get("/healthz", handlerReadiness);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
});