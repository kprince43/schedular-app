import jwt, { SignOptions } from 'jsonwebtoken';
import { JwtPayload, TokenPair } from '../types';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_EXPIRES = (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as SignOptions['expiresIn'];
const REFRESH_EXPIRES = (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as SignOptions['expiresIn'];

export const generateTokens = (payload: Omit<JwtPayload, 'type'>): TokenPair => {
  const accessToken = jwt.sign(
    { ...payload, type: 'access' },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES }
  );

  const refreshToken = jwt.sign(
    { ...payload, type: 'refresh' },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES }
  );

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, ACCESS_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, REFRESH_SECRET) as JwtPayload;
};

export const getRefreshTokenExpiry = (): Date => {
  const expiresStr = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  const days = parseInt(expiresStr.replace('d', '')) || 7;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};
