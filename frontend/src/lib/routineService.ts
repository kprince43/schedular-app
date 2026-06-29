import api from './api';
import {
  ApiResponse, Routine, RoutineFormValues,
  TodayRoutine, RoutineLog, RoutineAnalyticsData,
} from '@/types';

export const routineService = {
  list: async (): Promise<Routine[]> => {
    const { data } = await api.get<ApiResponse<Routine[]>>('/routines');
    return data.data!;
  },

  today: async (): Promise<TodayRoutine[]> => {
    const { data } = await api.get<ApiResponse<TodayRoutine[]>>('/routines/today');
    return data.data!;
  },

  overview: async () => {
    const { data } = await api.get('/routines/overview');
    return data.data;
  },

  get: async (id: string): Promise<Routine> => {
    const { data } = await api.get<ApiResponse<Routine>>(`/routines/${id}`);
    return data.data!;
  },

  create: async (payload: RoutineFormValues): Promise<Routine> => {
    const { data } = await api.post<ApiResponse<Routine>>('/routines', payload);
    return data.data!;
  },

  update: async (id: string, payload: Partial<RoutineFormValues>): Promise<Routine> => {
    const { data } = await api.patch<ApiResponse<Routine>>(`/routines/${id}`, payload);
    return data.data!;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/routines/${id}`);
  },

  log: async (id: string, status: string, note?: string, date?: string): Promise<RoutineLog> => {
    const { data } = await api.post<ApiResponse<RoutineLog>>(`/routines/${id}/log`, { status, note, date });
    return data.data!;
  },

  analytics: async (id: string): Promise<RoutineAnalyticsData> => {
    const { data } = await api.get<ApiResponse<RoutineAnalyticsData>>(`/routines/${id}/analytics`);
    return data.data!;
  },
};
