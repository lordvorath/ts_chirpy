import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { refresh_tokens,  NewRefreshToken, users } from "../schema.js";

export async function createRefreshToken(token: NewRefreshToken) {
  const [rows] = await db.insert(refresh_tokens).values(token).returning();
  return rows;
}

export async function getUserFromRefreshToken(token:string) {
    const [res] = await db
    .select()
    .from(refresh_tokens)
    .where(eq(refresh_tokens.token, token))
    .innerJoin(users, eq(users.id, refresh_tokens.userId));
    return res;
}

export async function revokeToken(token:string) {
    const result = await db.update(refresh_tokens)
    .set({revokedAt: new Date()})
    .where(eq(refresh_tokens.token, token))
    .returning();
    return result;
}