import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../../src/libs/utils";

describe("password hashing", () => {
  it("uses a unique salt and verifies only the correct password", async () => {
    const password = "correct horse battery staple";
    const firstHash = await hashPassword(password);
    const secondHash = await hashPassword(password);

    expect(firstHash).toMatch(/^pbkdf2-sha256\$600000\$/);
    expect(secondHash).not.toBe(firstHash);
    await expect(verifyPassword(firstHash, password)).resolves.toBe(true);
    await expect(verifyPassword(firstHash, "wrong password")).resolves.toBe(
      false
    );
  });

  it.each([
    "",
    "sha256$600000$c2FsdA==$aGFzaA==",
    "pbkdf2-sha256$not-a-number$c2FsdA==$aGFzaA==",
    "pbkdf2-sha256$600000$invalid-base64!$invalid-base64!",
    "pbkdf2-sha256$600000$c2FsdA==$aGFzaA==$extra"
  ])("rejects an invalid stored value: %s", async (storedPasswordHash) => {
    await expect(verifyPassword(storedPasswordHash, "password")).resolves.toBe(
      false
    );
  });
});
