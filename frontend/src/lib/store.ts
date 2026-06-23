import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, LoginPayload, RegisterPayload } from '@/types';
import { authService } from '@/lib/authService';
import { clearAuthCookies } from '@/lib/api';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authService.login(payload);
          set({ user: data.user, isAuthenticated: true, isLoading: false });
        } catch (err: unknown) {
          const message = extractErrorMessage(err);
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      register: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authService.register(payload);
          set({ user: data.user, isAuthenticated: true, isLoading: false });
        } catch (err: unknown) {
          const message = extractErrorMessage(err);
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authService.logout();
        } finally {
          clearAuthCookies();
          set({ ...initialState });
        }
      },

      fetchUser: async () => {
        if (get().isLoading) return;
        set({ isLoading: true });
        try {
          const user = await authService.getMe();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch {
          clearAuthCookies();
          set({ ...initialState });
        }
      },

      clearError: () => set({ error: null }),
      reset: () => {
        clearAuthCookies();
        set({ ...initialState });
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

function extractErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const axiosErr = err as { response?: { data?: { message?: string } } };
    return axiosErr.response?.data?.message || 'Something went wrong';
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
}
