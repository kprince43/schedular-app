import api, { setAuthCookies, clearAuthCookies } from './api';
import { AuthResponse, LoginPayload, RegisterPayload, ApiResponse, User } from '@/types';

export const authService = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/register', payload);
    if (data.data) {
      setAuthCookies(data.data.accessToken, data.data.refreshToken);
    }
    return data.data!;
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/login', payload);
    if (data.data) {
      setAuthCookies(data.data.accessToken, data.data.refreshToken);
    }
    return data.data!;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } finally {
      clearAuthCookies();
    }
  },

  getMe: async (): Promise<User> => {
    const { data } = await api.get<ApiResponse<User>>('/auth/me');
    return data.data!;
  },

  refreshTokens: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    const { data } = await api.post('/auth/refresh', { refreshToken });
    return data.data;
  },
};
