import { sign } from "hono/jwt";
import { SignatureAlgorithm } from "hono/utils/jwt/jwa";
import { JwtPayload } from "./types";
export * from "./types";

export const jwtSign = async (
  payload: JwtPayload,
  secret: string,
  alg = "HS256"
) => {
  return sign(payload, secret, alg as SignatureAlgorithm);
};

export const jwtVerify = async (
  token: string,
  secret: string,
  alg = "HS256"
) => {
  const { payload } = await import("hono/jwt").then((mod) =>
    mod.verify(token, secret, alg as SignatureAlgorithm)
  );
  return payload as JwtPayload;
};
