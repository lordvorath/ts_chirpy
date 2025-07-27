import { describe, it, expect, beforeAll, vitest } from "vitest";
import { checkPasswordHash, hashPassword, makeJWT, validateJWT } from "./auth";
import { fail } from "assert";
import { UnauthorizedError } from "./middleware";

describe("Password Hashing", () => {
  const password1 = "correctPassword123!";
  const password2 = "anotherPassword456!";
  let hash1: string;
  let hash2: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1);
    hash2 = await hashPassword(password2);
  });

  it("should return true for the correct password", async () => {
    const result = await checkPasswordHash(password1, hash1);
    expect(result).toBe(true);
  });
});

describe("JWT handling", () => {
    const userID1 = "abcdef12345";
    const secret = "verysecret";
    const expiresIn = 300;

    it("should successfully create a JWT", async () => {
        try {
            const result = makeJWT(userID1, expiresIn, secret);
            expect(result).toBeTruthy();
        } catch (e) {
            if (e instanceof Error) {
                fail(e);
            }
        }
    });

    it("should correctly retrieve user id", async () => {
        try {
            const result = makeJWT(userID1, expiresIn, secret);
            const retrievedID = validateJWT(result, secret);
            expect(retrievedID).toBe(userID1);
        } catch (e) {
            if (e instanceof Error) {
                fail(e);
            }
        }
    });

    it("should throw with expired token", async () => {
        const jwt = makeJWT(userID1, -300, secret);
        expect(() => validateJWT(jwt, secret)).toThrow(UnauthorizedError);
    });

    it("should throw with invalid token", async () => {
        expect(() => validateJWT("blahblahblah", secret)).toThrow(UnauthorizedError);
    });
});