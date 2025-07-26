import bcrypt from "bcrypt";
import { ForbiddenError, UnauthorizedError } from "./middleware.js";

export function hashPassword(password: string): string{
    const hp = bcrypt.hashSync(password, 10);
    return hp;
}

export function checkPasswordHash(password: string, hash: string) {
    if (!bcrypt.compareSync(password, hash)) {
        throw new UnauthorizedError("Incorrect email or password");
    }
}