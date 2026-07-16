import { OAuthTransactions, OAuthTransactionsSchema } from "./zod";

export const setOAuthTransactions = (
  env: Env,
  key: string,
  value: OAuthTransactions
) => {
  const data = OAuthTransactionsSchema.parse(value);
  return env.KV.put(`oauth_transactions:${key}`, JSON.stringify(data));
};

export const getOAuthTransactions = async (env: Env, key: string) => {
  const value = await env.KV.get(`oauth_transactions:${key}`);
  if (!value) return null;

  try {
    const parsed = JSON.parse(value);
    return OAuthTransactionsSchema.parse(parsed);
  } catch (error) {
    console.error("Failed to parse OAuthTransactions from KV:", error);
    return null;
  }
};

export const exchangeOAuthTransactions = async (
  env: Env,
  key: string,
  code: string
) => {
  const transaction = await getOAuthTransactions(env, key);
  if (!transaction) return null;

  // Mark the transaction as consumed
  transaction.exchangeCodeHash = code;
  transaction.exchangedAt = new Date().toISOString();
  transaction.updatedAt = new Date().toISOString();
  await setOAuthTransactions(env, key, transaction);

  return transaction;
};
