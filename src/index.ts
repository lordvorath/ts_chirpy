import express from "express";
import type { Request, Response, NextFunction } from "express";
import { cfg } from "./config.js";
import { BadRequestError, errorMiddleWare, middlewareLogResponse, middlewareMetricsInc } from "./middleware.js";
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

  let body: parameters = req.body;
  const maxChirpLength = 140;
  if (body.body.length > maxChirpLength) {
    throw new BadRequestError("Chirp is too long. Max length is 140");
  }

  const words = body.body.split(/\s+/);
  const badWords = ["kerfuffle", "sharbert", "fornax"];
  let cleaned = [];
  for (let i = 0; i < words.length; i++) {
    let w = words[i];
    for (let bw of badWords) {
      if (w.toLowerCase() === bw){
        w = "****";
      }
    }
    cleaned.push(w);
  }

  const cleanedBody = cleaned.join(" ");
  respondWithJSON(res, 200, {
    cleanedBody: cleanedBody,
  });

}


const app = express();
const PORT = 8080;

app.use(middlewareLogResponse);
app.use(express.json());

app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/api/healthz", (req, res, next) => {
  Promise.resolve(handlerReadiness(req, res)).catch(next);
});
app.get("/admin/metrics", (req, res, next) => {
  Promise.resolve(handlerMetrics(req, res)).catch(next);
});
app.post("/admin/reset", (req, res, next) => {
  Promise.resolve(handlerReset(req, res)).catch(next);
});

app.post("/api/validate_chirp", (req, res, next) => {
  Promise.resolve(handlerChirpsValidate(req, res)).catch(next);
});

app.use(errorMiddleWare);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`)
});