import type {Request, Response, NextFunction} from "express";
import { cfg } from "./config.js";
import { randomBytes } from "crypto";

export function middlewareLogResponses(req: Request, res: Response, next: NextFunction): void {
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