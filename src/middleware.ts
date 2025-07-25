import type {Request, Response, NextFunction} from "express";
import { cfg } from "./config.js";
import { randomBytes } from "crypto";
import { respondWithError } from "./json.js";

export function middlewareLogResponse(req: Request, res: Response, next: NextFunction): void {
    res.on("finish", () => {
        if (res.statusCode >= 300) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${res.statusCode}`);
        }
    });
    next();
}

export function  middlewareMetricsInc(req: Request, res: Response, next: NextFunction): void {
    cfg.fileserverHits++;
    
    next();
}

export function errorMiddleWare(err: Error, _: Request, res: Response, __: NextFunction): void {
    console.log(err.message);
    respondWithError(res, 500, "Something went wrong on our end");
}