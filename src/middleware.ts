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
    if (err instanceof BadRequestError   ||
        err instanceof UnauthorizedError ||
        err instanceof ForbiddenError    ||
        err instanceof NotFoundError
    ) {
        respondWithError(res, err.code, err.message)
    } else {
        respondWithError(res, 500, "Internal Server Error");
    }
}

export class BadRequestError extends Error {
    constructor(message: string) {
        super(message);
    }
    code = 400;
}
export class UnauthorizedError extends Error {
    constructor(message: string) {
        super(message);
    }
    code = 401;
}
export class ForbiddenError extends Error {
    constructor(message: string) {
        super(message);
    }
    code = 403;
}
export class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
    }
    code = 404;
}