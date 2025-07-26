import { db } from "../index.js";
import { NewChirp, chirps } from "../schema.js";

export async function createChirp(chirp: NewChirp) {
  const [result] = await db
    .insert(chirps)
    .values(chirp)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function getAllChirps() {
  const result = await db
    .select()
    .from(chirps);

    return result;
}

export async function deleteAllChirps() {
  await db
    .delete(chirps);
}