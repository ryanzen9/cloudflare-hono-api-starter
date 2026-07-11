export type JwtPayload = {
  sub: string;
  iat: number;
  exp: number;
  data: Record<string, any>;
};
