'use client';

import { useEffect } from 'react';
import { CheckSquare, Calendar, Clock, TrendingUp, ArrowRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { useScheduleStore } from '@/lib/scheduleStore';
import { StatusBadge, PriorityBadge } from '@/components/ui/badges';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { schedules, stats, fetchSchedules, fetchStats, isLoading } = useScheduleStore();

  useEffect(() => {
    fetchSchedules();
    fetchStats();
  }, [fetchSchedules, fetchStats]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name.split(' ')[0] || 'there';

  const completed = stats?.byStatus.find((s) => s.status === 'COMPLETED')?._count ?? 0;
  const total     = stats?.byStatus.reduce((a, s) => a + s._count, 0) ?? 0;
  const rate      = total ? Math.round((completed / total) * 100) : 0;

  const statCards = [
    { label: 'Total schedules', value: total || '—',          icon: Calendar,     color: 'bg-brand-50 text-brand-600'   },
    { label: 'Upcoming',        value: stats?.upcoming ?? '—', icon: Clock,        color: 'bg-amber-50 text-amber-600'   },
    { label: 'This week',       value: stats?.thisWeek ?? '—', icon: CheckSquare,  color: 'bg-blue-50 text-blue-600'     },
    { label: 'Completion rate', value: `${rate}%`,             icon: TrendingUp,   color: 'bg-emerald-50 text-emerald-600' },
  ];

  const recent = schedules.slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{greeting}, {firstName} 👋</h1>
          <p className="text-slate-500 mt-1 text-sm">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link href="/dashboard/schedules"
          className="hidden sm:flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors shadow-sm">
          <Plus className="h-3.5 w-3.5" />
          New schedule
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5 hover:shadow-md transition-shadow duration-200">
            <div className={cn('p-2.5 rounded-xl w-fit mb-4', color)}>
              <Icon className="h-4 w-4" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent schedules */}
      <div className="card">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Recent Schedules</h2>
          <Link href="/dashboard/schedules"
            className="text-xs text-brand-600 font-medium hover:text-brand-700 flex items-center gap-1 transition-colors">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {isLoading ? (
          <div className="divide-y divide-slate-50">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-5 py-3.5 flex items-center gap-4">
                <div className="h-4 bg-slate-100 rounded-full w-1/3 animate-pulse" />
                <div className="h-4 bg-slate-100 rounded-full w-16 animate-pulse ml-auto" />
              </div>
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-slate-500 mb-3">No schedules yet</p>
            <Link href="/dashboard/schedules"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
              <Plus className="h-3.5 w-3.5" />Create your first schedule
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recent.map((s) => (
              <div key={s.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{s.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(s.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <PriorityBadge priority={s.priority} />
                  <StatusBadge   status={s.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category breakdown */}
      {stats && stats.byCategory.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Schedules by Category</h2>
          <div className="space-y-3">
            {stats.byCategory
              .sort((a, b) => b._count - a._count)
              .map(({ category, _count }) => {
                const pct = total ? Math.round((_count / total) * 100) : 0;
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-600 font-medium capitalize">{category.toLowerCase()}</span>
                      <span className="text-slate-400 tabular-nums">{_count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
