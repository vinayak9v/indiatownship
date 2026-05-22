import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/User';
import { hashPassword, comparePassword, signTokens, verifyRefreshToken } from '../services/auth.service';
import { createError } from '../middleware/errorHandler';

function sanitizeUser(user: InstanceType<typeof UserModel>) {
  const obj = user.toObject() as unknown as Record<string, unknown>;
  delete obj.passwordHash;
  return obj;
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, phone, email, password } = req.body;
    if (!name || !password) return next(createError('name and password are required', 400));
    if (!phone && !email) return next(createError('phone or email is required', 400));

    const passwordHash = await hashPassword(password);
    const userData: Record<string, unknown> = { name, passwordHash };
    if (phone) userData.phone = phone;
    if (email) userData.email = email;

    let user;
    try {
      user = await UserModel.create(userData);
    } catch (err: unknown) {
      const e = err as { code?: number };
      if (e.code === 11000) return next(createError('Phone or email already registered', 409));
      throw err;
    }

    const { accessToken, refreshToken } = signTokens({ userId: String(user._id), role: user.role });
    res.status(201).json({ user: sanitizeUser(user), accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { phone, email, password } = req.body;
    if (!password || (!phone && !email)) return next(createError('Credentials required', 400));

    const query = phone ? { phone } : { email };
    const user = await UserModel.findOne(query);
    if (!user || !(await comparePassword(password, user.passwordHash))) {
      return next(createError('Invalid credentials', 401));
    }
    if (!user.isActive) return next(createError('Account deactivated', 403));

    const { accessToken, refreshToken } = signTokens({ userId: String(user._id), role: user.role });
    res.json({ user: sanitizeUser(user), accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return next(createError('refreshToken required', 400));
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      return next(createError('Invalid or expired refresh token', 401));
    }
    const { accessToken, refreshToken: newRefresh } = signTokens({
      userId: payload.userId,
      role: payload.role,
    });
    res.json({ accessToken, refreshToken: newRefresh });
  } catch (err) {
    next(err);
  }
}

export function logout(_req: Request, res: Response) {
  res.json({ message: 'Logged out' });
}
