'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, BarChart2, RefreshCw } from 'lucide-react';
import { routineService } from '@/lib/routineService';
import { Routine, TodayRoutine, RoutineFormValues, RoutineLogStatus, RoutineAnalyticsData } from '@/types';
import TodayCheckIn          from '@/components/routines/TodayCheckIn';
import RoutineCard           from '@/components/routines/RoutineCard';
import RoutineFormModal      from '@/components/routines/RoutineFormModal';
import RoutineAnalyticsPanel from '@/components/routines/RoutineAnalyticsPanel';
import ConfirmModal          from '@/components/ui/ConfirmModal';

type Tab = 'today' | 'all';

export default function RoutinesPage() {
  const [tab,            setTab]           = useState<Tab>('today');
  const [todayRoutines,  setTodayRoutines] = useState<TodayRoutine[]>([]);
  const [allRoutines,    setAllRoutines]   = useState<Routine[]>([]);
  const [isLoading,      setIsLoading]     = useState(true);
  const [isSubmitting,   setIsSubmitting]  = useState(false);
  const [formOpen,       setFormOpen]      = useState(false);
  const [editing,        setEditing]       = useState<Routine | null>(null);
  const [toDelete,       setToDelete]      = useState<Routine | null>(null);
  const [analyticsData,  setAnalyticsData] = useState<RoutineAnalyticsData | null>(null);
  const [toast,          setToast]         = useState<{ msg: string; type: 'success'|'error' } | null>(null);

  const showToast = (msg: string, type: 'success'|'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadToday = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await routineService.today();
      setTodayRoutines(data);
    } catch { showToast('Failed to load routines', 'error'); }
    finally   { setIsLoading(false); }
  }, []);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await routineService.list();
      setAllRoutines(data);
    } catch { showToast('Failed to load routines', 'error'); }
    finally   { setIsLoading(false); }
  }, []);

  useEffect(() => { loadToday(); loadAll(); }, [loadToday, loadAll]);

  const handleLog = async (id: string, status: RoutineLogStatus) => {
    try {
      await routineService.log(id, status);
      setTodayRoutines((prev) =>
        prev.map((r) => r.id === id ? { ...r, todayStatus: status } : r)
      );
    } catch { showToast('Failed to update log', 'error'); }
  };

  const handleFormSubmit = async (data: RoutineFormValues) => {
    setIsSubmitting(true);
    try {
      if (editing) {
        await routineService.update(editing.id, data);
        showToast('Routine updated');
      } else {
        await routineService.create(data);
        showToast('Routine created');
      }
      setFormOpen(false); setEditing(null);
      loadAll(); loadToday();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setIsSubmitting(true);
    try {
      await routineService.delete(toDelete.id);
      showToast('Routine deleted');
      setToDelete(null);
      loadAll(); loadToday();
    } catch { showToast('Delete failed', 'error'); }
    finally  { setIsSubmitting(false); }
  };

  const handleToggle = async (r: Routine) => {
    try {
      await routineService.update(r.id, { isActive: !r.isActive } as never);
      loadAll(); loadToday();
    } catch { showToast('Update failed', 'error'); }
  };

  const handleShowAnalytics = async (id: string) => {
    try {
      const data = await routineService.analytics(id);
      setAnalyticsData(data);
    } catch { showToast('Failed to load analytics', 'error'); }
  };

  const active   = allRoutines.filter((r) => r.isActive);
  const inactive = allRoutines.filter((r) => !r.isActive);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white animate-slide-up ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Routines</h1>
          <p className="text-slate-500 text-sm mt-1">Build habits, track consistency, get insights</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { loadToday(); loadAll(); }}
            className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => { setEditing(null); setFormOpen(true); }}
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors shadow-sm">
            <Plus className="h-4 w-4" />New routine
          </button>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {(['today', 'all'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            {t === 'today' ? "Today's Check-in" : `All Routines (${allRoutines.length})`}
          </button>
        ))}
      </div>

      {/* Today tab */}
      {tab === 'today' && (
        <div className="space-y-4">
          <TodayCheckIn routines={todayRoutines} isLoading={isLoading} onLog={handleLog} />

          {/* Overview stats */}
          {!isLoading && allRoutines.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total routines', value: allRoutines.length,  color: 'bg-brand-50 text-brand-600'   },
                { label: 'Active',         value: active.length,        color: 'bg-emerald-50 text-emerald-600' },
                { label: 'Paused',         value: inactive.length,      color: 'bg-slate-100 text-slate-500'  },
              ].map(({ label, value, color }) => (
                <div key={label} className="card p-4 text-center">
                  <p className={`text-2xl font-bold ${color.split(' ')[1]}`}>{value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* All routines tab */}
      {tab === 'all' && (
        <div className="space-y-6">
          {isLoading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card h-40 animate-pulse bg-slate-50" />
              ))}
            </div>
          ) : allRoutines.length === 0 ? (
            <div className="card p-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
                <BarChart2 className="h-6 w-6 text-brand-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">No routines yet</h3>
              <p className="text-sm text-slate-500 mb-4">Create your first routine to start tracking habits</p>
              <button onClick={() => setFormOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors">
                <Plus className="h-4 w-4" />Create routine
              </button>
            </div>
          ) : (
            <>
              {active.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Active ({active.length})</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {active.map((r) => (
                      <div key={r.id} className="relative group">
                        <RoutineCard
                          routine={r}
                          onEdit={() => { setEditing(r); setFormOpen(true); }}
                          onDelete={() => setToDelete(r)}
                          onToggle={() => handleToggle(r)}
                        />
                        <button
                          onClick={() => handleShowAnalytics(r.id)}
                          className="absolute top-3 right-20 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50"
                          title="View analytics"
                        >
                          <BarChart2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {inactive.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Paused ({inactive.length})</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {inactive.map((r) => (
                      <RoutineCard key={r.id} routine={r}
                        onEdit={() => { setEditing(r); setFormOpen(true); }}
                        onDelete={() => setToDelete(r)}
                        onToggle={() => handleToggle(r)} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Modals */}
      <RoutineFormModal
        isOpen={formOpen} routine={editing}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSubmit={handleFormSubmit} isSubmitting={isSubmitting}
      />
      <ConfirmModal
        isOpen={!!toDelete}
        title="Delete routine?"
        message={`"${toDelete?.title}" and all its logs will be permanently deleted.`}
        onConfirm={handleDelete} onCancel={() => setToDelete(null)} isLoading={isSubmitting}
      />
      {analyticsData && (
        <RoutineAnalyticsPanel data={analyticsData} onClose={() => setAnalyticsData(null)} />
      )}
    </div>
  );
}
