import api from './api';
import { ApiResponse, AnalyticsData } from '@/types';

export const analyticsService = {
  get: async (): Promise<AnalyticsData> => {
    const { data } = await api.get<ApiResponse<AnalyticsData>>('/analytics');
    return data.data!;
  },
};
