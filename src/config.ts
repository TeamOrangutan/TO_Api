import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

export const PORT = Number(process.env.PORT) || 4000

export const JWT_SECRET = process.env.JWT_SECRET!;
export const ACCESS_TOKEN_EXPIRATION = process.env.ACCESS_TOKEN_EXPIRATION!;
export const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION!;
export const JWT_ROUND = Number(process.env.JWT_ROUND!);
