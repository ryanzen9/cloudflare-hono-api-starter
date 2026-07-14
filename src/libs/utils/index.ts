const PASSWORD_HASH_ALGORITHM = "pbkdf2-sha256";
const PBKDF2_ITERATIONS = 600_000;
const PASSWORD_SALT_LENGTH = 16;
const PASSWORD_HASH_LENGTH = 32;
const textEncoder = new TextEncoder();

const encodeBase64 = (value: Uint8Array) => {
  return btoa(String.fromCharCode(...value));
};

const decodeBase64 = (value: string) => {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
};

const derivePasswordHash = async (
  password: string,
  salt: Uint8Array,
  iterations: number
) => {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const hash = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt,
      iterations
    },
    keyMaterial,
    PASSWORD_HASH_LENGTH * 8
  );

  return new Uint8Array(hash);
};

/**
 * 使用 PBKDF2-HMAC-SHA256 和随机盐派生密码哈希。
 * @param password 用户提交的明文密码。
 * @returns 包含算法、工作因子、盐和派生结果的可存储字符串。
 */
export const hashPassword = async (password: string) => {
  const salt = crypto.getRandomValues(new Uint8Array(PASSWORD_SALT_LENGTH));
  const hash = await derivePasswordHash(password, salt, PBKDF2_ITERATIONS);

  return [
    PASSWORD_HASH_ALGORITHM,
    PBKDF2_ITERATIONS,
    encodeBase64(salt),
    encodeBase64(hash)
  ].join("$");
};

/**
 * 使用存储值中的盐和参数验证明文密码。
 * @param storedPasswordHash 数据库中保存的密码哈希字符串。
 * @param password 用户提交的明文密码。
 * @returns 密码匹配时返回 true；格式无效或密码错误时返回 false。
 */
export const verifyPassword = async (
  storedPasswordHash: string,
  password: string
) => {
  const [algorithm, iterationText, encodedSalt, encodedHash, extraPart] =
    storedPasswordHash.split("$");

  if (
    extraPart !== undefined ||
    algorithm !== PASSWORD_HASH_ALGORITHM ||
    iterationText !== String(PBKDF2_ITERATIONS) ||
    !encodedSalt ||
    !encodedHash
  ) {
    return false;
  }

  let salt: Uint8Array;
  let expectedHash: Uint8Array;
  try {
    salt = decodeBase64(encodedSalt);
    expectedHash = decodeBase64(encodedHash);
  } catch {
    return false;
  }

  if (
    salt.byteLength !== PASSWORD_SALT_LENGTH ||
    expectedHash.byteLength !== PASSWORD_HASH_LENGTH
  ) {
    return false;
  }

  const actualHash = await derivePasswordHash(
    password,
    salt,
    PBKDF2_ITERATIONS
  );
  return crypto.subtle.timingSafeEqual(actualHash, expectedHash);
};
