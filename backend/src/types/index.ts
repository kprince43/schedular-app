import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
  type: 'access' | 'refresh';
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface UserPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  isVerified: boolean;
  createdAt: Date;
}
