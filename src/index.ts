import express from "express";
import type { Request, Response, NextFunction } from "express";
import { cfg } from "./config.js";
import { middlewareLogResponses, middlewareMetricsInc } from "./middleware.js";
import { channel } from "diagnostics_channel";
import { ifError } from "assert";




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

async function handlerValidateChirp(req: Request, res: Response): Promise<void> {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", () => {
    res.header("Content-Type", "application/json");

    try {
      const parsedBody: { body: string } = JSON.parse(body);
      if (!parsedBody.body) {
        res
          .status(400)
          .send(JSON.stringify({
            error: "Missing body in JSON"
          }));
      } else if (parsedBody.body.length > 140) {
        res
          .status(400)
          .send(JSON.stringify({
            error: "Chirp is too long"
          }));
      } else {
        res
          .status(200)
          .send(JSON.stringify({
            valid: true
          }));
      }
      res.end();
    } catch (err) {
      if (err instanceof Error) {
        res
          .status(400)
          .send(JSON.stringify({
            error: `Invalid JSON: ${err.message}`
          }));
      } else {
        res
          .status(400)
          .send(JSON.stringify({
            error: `Something went wrong`
          }));
      }
      res.end();
    }
  });

}

const app = express();
const PORT = 8080;

app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", handlerMetrics);

app.post("/admin/reset", handlerReset);
app.post("/api/validate_chirp", handlerValidateChirp)

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`)
});