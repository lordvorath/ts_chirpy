import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewUser, users } from "../schema.js";
import { UnauthorizedError } from "../../middleware.js";

export async function createUser(user: NewUser) {
  const [result] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function deleteAllUsers() {
  await db
    .delete(users);
}

export async function getUserByEmail(email: string): Promise<NewUser> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (result.length === 0) {
    throw new UnauthorizedError("Incorrect email or password");
  }
  return result[0];
}