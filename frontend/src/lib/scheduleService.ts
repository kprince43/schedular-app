import api from './api';
import {
  ApiResponse, Schedule, ScheduleFormValues,
  ScheduleFilters, PaginatedResponse, ScheduleStats,
} from '@/types';

export const scheduleService = {
  list: async (
    filters: ScheduleFilters = {},
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<Schedule>> => {
    const params: Record<string, string> = {
      page:  String(page),
      limit: String(limit),
    };
    if (filters.search)    params.search    = filters.search;
    if (filters.status)    params.status    = filters.status;
    if (filters.category)  params.category  = filters.category;
    if (filters.priority)  params.priority  = filters.priority;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate)   params.endDate   = filters.endDate;
    if (filters.sortBy)    params.sortBy    = filters.sortBy;
    if (filters.sortOrder) params.sortOrder = filters.sortOrder;

    const { data } = await api.get<ApiResponse<PaginatedResponse<Schedule>>>('/schedules', { params });
    return data.data!;
  },

  get: async (id: string): Promise<Schedule> => {
    const { data } = await api.get<ApiResponse<Schedule>>(`/schedules/${id}`);
    return data.data!;
  },

  create: async (payload: ScheduleFormValues): Promise<Schedule> => {
    const { data } = await api.post<ApiResponse<Schedule>>('/schedules', payload);
    return data.data!;
  },

  update: async (id: string, payload: Partial<ScheduleFormValues>): Promise<Schedule> => {
    const { data } = await api.patch<ApiResponse<Schedule>>(`/schedules/${id}`, payload);
    return data.data!;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/schedules/${id}`);
  },

  stats: async (): Promise<ScheduleStats> => {
    const { data } = await api.get<ApiResponse<ScheduleStats>>('/schedules/stats');
    return data.data!;
  },
};
