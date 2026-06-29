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

// ── Analytics ─────────────────────────────────────────────────────────────────
export interface AnalyticsSummary {
  total: number; completed: number; missed: number;
  pending: number; inProgress: number; cancelled: number;
  completionRate: number; productivityScore: number;
  streak: number; weeklyRate: number;
}

export interface ChartDataPoint { name: string; value: number; }

export interface DailyTrendPoint {
  date: string; label: string; created: number; completed: number;
}

export interface WeeklyActivityPoint {
  day: string; total: number; completed: number; rate: number;
}

export interface HourlyPoint { hour: string; count: number; }

export interface AnalyticsData {
  summary:            AnalyticsSummary;
  byCategory:         ChartDataPoint[];
  byPriority:         ChartDataPoint[];
  byStatus:           ChartDataPoint[];
  dailyTrend:         DailyTrendPoint[];
  weeklyActivity:     WeeklyActivityPoint[];
  hourlyDistribution: HourlyPoint[];
}

// ── Routines ──────────────────────────────────────────────────────────────────
export type RoutineFrequency  = 'DAILY' | 'WEEKLY' | 'WEEKDAYS' | 'WEEKENDS';
export type RoutineLogStatus  = 'PENDING' | 'DONE' | 'SKIPPED' | 'MISSED';

export interface RoutineLog {
  id: string; routineId: string;
  date: string; status: RoutineLogStatus; note: string | null;
  createdAt: string; updatedAt: string;
}

export interface Routine {
  id: string; title: string; description: string | null;
  frequency: RoutineFrequency; targetDays: number[];
  startTime: string; endTime: string;
  category: ScheduleCategory; isActive: boolean;
  userId: string; createdAt: string; updatedAt: string;
  logs?: RoutineLog[];
}

export interface TodayRoutine extends Routine {
  todayLog:    RoutineLog | null;
  todayStatus: RoutineLogStatus;
}

export interface RoutineFormValues {
  title: string; description?: string;
  frequency: RoutineFrequency; targetDays: number[];
  startTime: string; endTime: string;
  category: ScheduleCategory; isActive: boolean;
}

export interface RoutineOverviewItem {
  id: string; title: string; category: ScheduleCategory;
  frequency: RoutineFrequency; isActive: boolean;
  adherence: number; streak: number; total: number; done: number;
}

export interface RoutineAnalyticsData {
  routine: { id: string; title: string; frequency: string };
  summary: { total: number; done: number; skipped: number; missed: number; adherence: number; streak: number; bestStreak: number };
  last30:  { date: string; status: string }[];
  dowAdherence: { day: string; done: number; total: number; adherence: number }[];
}
