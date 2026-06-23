import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { generateTokens, verifyRefreshToken, getRefreshTokenExpiry } from '../utils/jwt';
import {
  sendSuccess, sendCreated, sendError,
  sendUnauthorized, sendServerError
} from '../utils/response';
import { AuthenticatedRequest, UserPayload } from '../types';

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');

const sanitizeUser = (user: {
  id: string; email: string; name: string;
  role: string; isVerified: boolean; createdAt: Date;
}): UserPayload => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
});

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      sendError(res, 'Email already registered', 409);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    const tokens = generateTokens({ id: user.id, email: user.email, role: user.role });

    await prisma.userSession.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    sendCreated(res, 'Account created successfully', {
      user: sanitizeUser(user),
      ...tokens,
    });
  } catch (error) {
    console.error('Register error:', error);
    sendServerError(res);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      sendUnauthorized(res, 'Invalid email or password');
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      sendUnauthorized(res, 'Invalid email or password');
      return;
    }

    const tokens = generateTokens({ id: user.id, email: user.email, role: user.role });

    await prisma.userSession.deleteMany({ where: { userId: user.id } });
    await prisma.userSession.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    sendSuccess(res, 'Login successful', {
      user: sanitizeUser(user),
      ...tokens,
    });
  } catch (error) {
    console.error('Login error:', error);
    sendServerError(res);
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    const payload = verifyRefreshToken(token);
    if (payload.type !== 'refresh') {
      sendUnauthorized(res, 'Invalid token type');
      return;
    }

    const session = await prisma.userSession.findUnique({ where: { token } });
    if (!session || session.expiresAt < new Date()) {
      sendUnauthorized(res, 'Session expired');
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) {
      sendUnauthorized(res, 'User not found');
      return;
    }

    const tokens = generateTokens({ id: user.id, email: user.email, role: user.role });

    await prisma.userSession.update({
      where: { token },
      data: { token: tokens.refreshToken, expiresAt: getRefreshTokenExpiry() },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    sendSuccess(res, 'Tokens refreshed', tokens);
  } catch {
    sendUnauthorized(res, 'Invalid or expired refresh token');
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (req.user) {
      await prisma.userSession.deleteMany({ where: { userId: req.user.id } });
      await prisma.user.update({
        where: { id: req.user.id },
        data: { refreshToken: null },
      });
    }
    sendSuccess(res, 'Logged out successfully');
  } catch (error) {
    console.error('Logout error:', error);
    sendServerError(res);
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, name: true, role: true, isVerified: true, createdAt: true },
    });

    if (!user) {
      sendUnauthorized(res, 'User not found');
      return;
    }

    sendSuccess(res, 'User retrieved', user);
  } catch (error) {
    console.error('GetMe error:', error);
    sendServerError(res);
  }
};
