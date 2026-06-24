'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { useScheduleStore } from '@/lib/scheduleStore';
import { Schedule, ScheduleFilters, ScheduleFormValues } from '@/types';
import StatsCards       from '@/components/schedules/StatsCards';
import FilterBar        from '@/components/schedules/FilterBar';
import ScheduleTable    from '@/components/schedules/ScheduleTable';
import Pagination       from '@/components/schedules/Pagination';
import ScheduleFormModal from '@/components/schedules/ScheduleFormModal';
import ConfirmModal     from '@/components/ui/ConfirmModal';

export default function SchedulesPage() {
  const {
    schedules, pagination, stats, filters, page, isLoading, isSubmitting, error,
    fetchSchedules, fetchStats, createSchedule, updateSchedule, deleteSchedule,
    setFilters, setPage, clearError,
  } = useScheduleStore();

  const [formOpen,    setFormOpen]    = useState(false);
  const [editing,     setEditing]     = useState<Schedule | null>(null);
  const [toDelete,    setToDelete]    = useState<Schedule | null>(null);
  const [toast,       setToast]       = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load data on mount and when filters/page change
  useEffect(() => { fetchSchedules(); }, [filters, page, fetchSchedules]);
  useEffect(() => { fetchStats(); },    [fetchStats]);

  const handleFilterChange = useCallback((f: ScheduleFilters) => {
    setFilters(f);
  }, [setFilters]);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit   = (s: Schedule) => { setEditing(s); setFormOpen(true); };

  const handleFormSubmit = async (data: ScheduleFormValues) => {
    try {
      if (editing) {
        await updateSchedule(editing.id, data);
        showToast('Schedule updated successfully');
      } else {
        await createSchedule(data);
        showToast('Schedule created successfully');
      }
      setFormOpen(false);
      setEditing(null);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Something went wrong', 'error');
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteSchedule(toDelete.id);
      showToast('Schedule deleted');
      setToDelete(null);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Delete failed', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white animate-slide-up ${
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Schedules</h1>
          <p className="text-slate-500 text-sm mt-1">Plan, track, and manage your time</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => { fetchSchedules(); fetchStats(); }}
            className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors shadow-sm">
            <Plus className="h-4 w-4" />
            New schedule
          </button>
        </div>
      </div>

      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Error banner */}
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button onClick={clearError} className="text-red-500 hover:text-red-700 font-medium ml-4">Dismiss</button>
        </div>
      )}

      {/* Filter bar */}
      <FilterBar
        filters={filters}
        onChange={handleFilterChange}
        total={pagination?.total ?? 0}
      />

      {/* Table */}
      <ScheduleTable
        schedules={schedules}
        isLoading={isLoading}
        onEdit={openEdit}
        onDelete={setToDelete}
      />

      {/* Pagination */}
      {pagination && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          hasPrev={pagination.hasPrev}
          hasNext={pagination.hasNext}
          onPage={setPage}
        />
      )}

      {/* Form modal */}
      <ScheduleFormModal
        isOpen={formOpen}
        schedule={editing}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Delete confirm */}
      <ConfirmModal
        isOpen={!!toDelete}
        title="Delete schedule?"
        message={`"${toDelete?.title}" will be permanently deleted. This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
        isLoading={isSubmitting}
      />
    </div>
  );
}
