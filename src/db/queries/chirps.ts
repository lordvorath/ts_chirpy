import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { chirps, NewChirp } from "../schema.js";
import { ChildProcess } from "child_process";

export async function createChirp(chirp: NewChirp) {
  const [rows] = await db.insert(chirps).values(chirp).returning();
  return rows;
}

export async function getAllChirps() {
  return db.select().from(chirps).orderBy(chirps.createdAt);
}

export async function getChirpByID(id: string) {
  const rows = await db.select().from(chirps).where(eq(chirps.id, id));
  if (rows.length === 0) {
    return;
  }
  return rows[0];
}

export async function deleteChirpByID(id: string) {
  await db
    .delete(chirps)
    .where(eq(chirps.id, id));
}

export async function getChirpsByAuthor(userId: string) {
  return db
    .select()
    .from(chirps)
    .where(eq(chirps.userId, userId))
    .orderBy(chirps.createdAt);
}