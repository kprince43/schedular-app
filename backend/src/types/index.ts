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

export type ScheduleStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type ScheduleCategory = 'WORK' | 'PERSONAL' | 'HEALTH' | 'EDUCATION' | 'FINANCE' | 'SOCIAL' | 'OTHER';
export type PriorityType = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface ScheduleFilters {
  status?: ScheduleStatus;
  category?: ScheduleCategory;
  priority?: PriorityType;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
