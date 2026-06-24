import { create } from 'zustand';
import { Schedule, ScheduleFilters, ScheduleFormValues, PaginatedResponse, ScheduleStats } from '@/types';
import { scheduleService } from './scheduleService';

interface ScheduleStore {
  // data
  schedules:   Schedule[];
  pagination:  Omit<PaginatedResponse<Schedule>, 'items'> | null;
  stats:       ScheduleStats | null;
  // ui
  filters:     ScheduleFilters;
  page:        number;
  limit:       number;
  isLoading:   boolean;
  isSubmitting:boolean;
  error:       string | null;
  selected:    Schedule | null;

  // actions
  fetchSchedules: () => Promise<void>;
  fetchStats:     () => Promise<void>;
  createSchedule: (data: ScheduleFormValues) => Promise<Schedule>;
  updateSchedule: (id: string, data: Partial<ScheduleFormValues>) => Promise<Schedule>;
  deleteSchedule: (id: string) => Promise<void>;
  setFilters:     (filters: ScheduleFilters) => void;
  setPage:        (page: number) => void;
  setSelected:    (s: Schedule | null) => void;
  clearError:     () => void;
}

export const useScheduleStore = create<ScheduleStore>((set, get) => ({
  schedules:    [],
  pagination:   null,
  stats:        null,
  filters:      {},
  page:         1,
  limit:        10,
  isLoading:    false,
  isSubmitting: false,
  error:        null,
  selected:     null,

  fetchSchedules: async () => {
    set({ isLoading: true, error: null });
    try {
      const { filters, page, limit } = get();
      const result = await scheduleService.list(filters, page, limit);
      const { items, ...pagination } = result;
      set({ schedules: items, pagination, isLoading: false });
    } catch (err: unknown) {
      set({ error: extractMsg(err), isLoading: false });
    }
  },

  fetchStats: async () => {
    try {
      const stats = await scheduleService.stats();
      set({ stats });
    } catch { /* non-critical */ }
  },

  createSchedule: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      const schedule = await scheduleService.create(data);
      set({ isSubmitting: false });
      get().fetchSchedules();
      get().fetchStats();
      return schedule;
    } catch (err: unknown) {
      const msg = extractMsg(err);
      set({ error: msg, isSubmitting: false });
      throw new Error(msg);
    }
  },

  updateSchedule: async (id, data) => {
    set({ isSubmitting: true, error: null });
    try {
      const schedule = await scheduleService.update(id, data);
      set((state) => ({
        schedules:    state.schedules.map((s) => (s.id === id ? schedule : s)),
        isSubmitting: false,
      }));
      get().fetchStats();
      return schedule;
    } catch (err: unknown) {
      const msg = extractMsg(err);
      set({ error: msg, isSubmitting: false });
      throw new Error(msg);
    }
  },

  deleteSchedule: async (id) => {
    set({ isSubmitting: true, error: null });
    try {
      await scheduleService.delete(id);
      set((state) => ({
        schedules:    state.schedules.filter((s) => s.id !== id),
        isSubmitting: false,
      }));
      get().fetchStats();
    } catch (err: unknown) {
      const msg = extractMsg(err);
      set({ error: msg, isSubmitting: false });
      throw new Error(msg);
    }
  },

  setFilters: (filters) => set({ filters, page: 1 }),
  setPage:    (page)    => set({ page }),
  setSelected:(s)       => set({ selected: s }),
  clearError: ()        => set({ error: null }),
}));

function extractMsg(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const e = err as { response?: { data?: { message?: string } } };
    return e.response?.data?.message || 'Something went wrong';
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
}
