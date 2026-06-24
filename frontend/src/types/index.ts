export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  isVerified: boolean;
  createdAt: string;
}

export interface AuthTokens { accessToken: string; refreshToken: string; }

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: { field: string; message: string }[];
}

export interface LoginPayload    { email: string; password: string; }
export interface RegisterPayload { name: string; email: string; password: string; confirmPassword: string; }
export interface AuthResponse    { user: User; accessToken: string; refreshToken: string; }

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
export type ScheduleStatus   = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type ScheduleCategory = 'WORK' | 'PERSONAL' | 'HEALTH' | 'EDUCATION' | 'FINANCE' | 'SOCIAL' | 'OTHER';
export type Priority         = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Schedule {
  id:          string;
  title:       string;
  description: string | null;
  category:    ScheduleCategory;
  priority:    Priority;
  status:      ScheduleStatus;
  startTime:   string;
  endTime:     string;
  userId:      string;
  createdAt:   string;
  updatedAt:   string;
}

export interface ScheduleFormValues {
  title:        string;
  description?: string;
  category:     ScheduleCategory;
  priority:     Priority;
  status:       ScheduleStatus;
  startTime:    string;
  endTime:      string;
}

export interface ScheduleFilters {
  search?:    string;
  status?:    ScheduleStatus | '';
  category?:  ScheduleCategory | '';
  priority?:  Priority | '';
  startDate?: string;
  endDate?:   string;
  sortBy?:    string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items:      T[];
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
  hasNext:    boolean;
  hasPrev:    boolean;
}

export interface ScheduleStats {
  byStatus:   { status: ScheduleStatus; _count: number }[];
  byCategory: { category: ScheduleCategory; _count: number }[];
  byPriority: { priority: Priority; _count: number }[];
  thisWeek:   number;
  upcoming:   number;
}

export interface Task {
  id: string; title: string; description?: string;
  status: TaskStatus; priority: Priority;
  dueDate?: string; completedAt?: string;
  createdAt: string; updatedAt: string;
}
