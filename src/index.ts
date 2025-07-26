import express from "express";
import type { Request, Response, NextFunction } from "express";
import { cfg } from "./config.js";
import { BadRequestError, errorMiddleWare, ForbiddenError, middlewareLogResponse, middlewareMetricsInc, NotFoundError } from "./middleware.js";
import { respondWithError, respondWithJSON } from "./json.js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { createUser, deleteAllUsers, getUserByEmail } from "./db/queries/users.js";
import { createChirp, getAllChirps, getChirpByID } from "./db/queries/chirps.js";
import { checkPasswordHash, hashPassword } from "./auth.js";
import { NewUser } from "./db/schema.js";

const migrationClient = postgres(cfg.db.url, { max: 1 });
await migrate(drizzle(migrationClient), cfg.db.migrationConfig);


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
  if (cfg.platform !== "dev") {
    respondWithError(res, 403, "Forbidden");
    return;
  }
  cfg.fileserverHits = 0;
  await deleteAllUsers();
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.write("Metrics reset");
  res.end();
}

function validateChirp(chirp: string) {
  const maxChirpLength = 140;
  if (chirp.length > maxChirpLength) {
    throw new BadRequestError("Chirp is too long. Max length is 140");
  }

  const words = chirp.split(/\s+/);
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
  return cleanedBody;

}

async function handlerCreateUser(req:Request, res: Response) {
  type params = {
    email: string
    password: string
  }

  const pp: params = req.body;
  const hp = hashPassword(pp.password)

  const newUser = await createUser({
    email: pp.email,
    hashedPassword: hp,

  });

  const resp: Omit<NewUser, "hashedPassword"> = newUser;

  respondWithJSON(res, 201, resp);
}

async function handlerCreateChirp(req:Request, res: Response) {
  type params = {
    body: string,
    userId: string,
  }
  const p: params = req.body;
  const chirpText = validateChirp(p.body);

  const newChirp = await createChirp({body: chirpText, userId: p.userId});

  respondWithJSON(res, 201, newChirp);
}

async function handlerGetAllChrips(req:Request, res: Response) {
  const chirps = await getAllChirps();
  respondWithJSON(res, 200, chirps);
}
async function handlerGetChirpByID(req:Request, res: Response) {
  const chirp = await getChirpByID(req.params.chirpID)  ;
  if (!chirp) {
    throw new NotFoundError(`Chirp with chirpId: ${req.params.chirpID} not found`);
  }
  respondWithJSON(res, 200, chirp);
}

async function handlerLogin(req:Request, res: Response) {
  type params = {
    password: string
    email: string
  }

  const pp: params = req.body;
  const user = await getUserByEmail(pp.email);
  if (!user.hashedPassword || user.hashedPassword === "unset"){
    throw new ForbiddenError("Reset your password");
  }

  try {
    checkPasswordHash(pp.password, user.hashedPassword);
  } catch (err) {
    throw err;
  }

  const resp: Omit<NewUser, "hashedPassword"> = user;
  respondWithJSON(res, 200, resp);
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
app.get("/api/chirps", (req, res, next) => {
  Promise.resolve(handlerGetAllChrips(req, res)).catch(next);
});
app.get("/api/chirps/:chirpID", (req, res, next) => {
  Promise.resolve(handlerGetChirpByID(req, res)).catch(next);
});


app.post("/admin/reset", (req, res, next) => {
  Promise.resolve(handlerReset(req, res)).catch(next);
});
app.post("/api/users", (req, res, next) => {
  Promise.resolve(handlerCreateUser(req, res)).catch(next);
});
app.post("/api/login", (req, res, next) => {
  Promise.resolve(handlerLogin(req, res)).catch(next);
});
app.post("/api/chirps", (req, res, next) => {
  Promise.resolve(handlerCreateChirp(req, res)).catch(next);
});

app.use(errorMiddleWare);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`)
});