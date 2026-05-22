import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export interface TokenPayload {
  userId: string;
  role: 'user' | 'admin';
}

export function signTokens(payload: TokenPayload): { accessToken: string; refreshToken: string } {
  const jwtSecret = process.env.JWT_SECRET!;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET!;
  const accessToken = jwt.sign(payload, jwtSecret, {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES ?? '15m') as jwt.SignOptions['expiresIn'],
  });
  const refreshToken = jwt.sign(payload, jwtRefreshSecret, {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES ?? '30d') as jwt.SignOptions['expiresIn'],
  });
  return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as TokenPayload;
}
