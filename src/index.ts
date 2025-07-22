import express from "express";
import type { Request, Response, NextFunction } from "express";
import { cfg } from "./config.js";
import { middlewareLogResponses, middlewareMetricsInc } from "./middleware.js";
import { channel } from "diagnostics_channel";
import { ifError } from "assert";
import { respondWithError, respondWithJSON } from "./json.js";




async function handlerReadiness(req: Request, res: Response): Promise<void> {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.send("OK");
}

async function handlerMetrics(req: Request, res: Response): Promise<void> {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(`<html>
  <body>
    <h1>Welcome, Chirpy Admin</h1>
    <p>Chirpy has been visited ${cfg.fileserverHits} times!</p>
  </body>
</html>`);
}

async function handlerReset(req: Request, res: Response): Promise<void> {
  cfg.fileserverHits = 0;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.write("Metrics reset");
  res.end();
}

async function handlerChirpsValidate(req: Request, res: Response) {
  type parameters = {
    body: string;
  };

  let body = "";

  req.on("data", (chunk) => {
    body += chunk;
  });

  let params: parameters;
  req.on("end", () => {
    try {
      params = JSON.parse(body);
    } catch (e) {
      respondWithError(res, 400, "Invalid JSON");
      return;
    }
    const maxChirpLength = 140;
    if (params.body.length > maxChirpLength) {
      respondWithError(res, 400, "Chirp is too long");
      return;
    }

    respondWithJSON(res, 200, {
      valid: true,
    });
  });
}

const app = express();
const PORT = 8080;

app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", handlerMetrics);

app.post("/admin/reset", handlerReset);
app.post("/api/validate_chirp", handlerChirpsValidate)

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`)
});