import bcrypt from "bcrypt";
import { ForbiddenError, UnauthorizedError } from "./middleware.js";
import { JwtPayload, sign, verify } from "jsonwebtoken";

const TOKEN_ISSUER = "chirpy";

export async function hashPassword(password: string) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function checkPasswordHash(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export function makeJWT(userID: string, expiresIn: number, secret: string): string {
    
    const p: payload = {
        iss: TOKEN_ISSUER,
        sub: userID,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + expiresIn,
    };
    const jwt = sign(p, secret, { algorithm: "HS256" });
    return jwt;
}

export function validateJWT(tokenString: string, secret: string): string {
    let decoded: payload;
  try {
    decoded = verify(tokenString, secret) as JwtPayload;
  } catch (e) {
    throw new UnauthorizedError("Invalid token");
  }

  if (decoded.iss !== TOKEN_ISSUER) {
    throw new UnauthorizedError("Invalid issuer");
  }

  if (!decoded.sub) {
    throw new UnauthorizedError("No user ID in token");
  }

  return decoded.sub;
}