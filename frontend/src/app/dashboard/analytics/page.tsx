'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, TrendingUp, Calendar, Zap, Flame } from 'lucide-react';
import { analyticsService } from '@/lib/analyticsService';
import { AnalyticsData } from '@/types';
import KPICards             from '@/components/analytics/KPICards';
import ScoreGauge           from '@/components/analytics/ScoreGauge';
import TrendChart           from '@/components/analytics/TrendChart';
import HourlyChart          from '@/components/analytics/HourlyChart';
import { CategoryDonut, PriorityBar, StatusDonut } from '@/components/analytics/DistributionCharts';
import WeeklyChart          from '@/components/analytics/WeeklyChart';
import RoutineOverviewChart from '@/components/analytics/RoutineOverviewChart';

function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-slate-100 rounded-2xl animate-pulse ${className}`} />;
}

function InsightCard({
  emoji, title, value, desc, positive,
}: { emoji: string; title: string; value: string; desc: string; positive: boolean }) {
  return (
    <div className={`card p-5 border-l-4 ${positive ? 'border-l-brand-400' : 'border-l-amber-400'}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{emoji}</span>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</p>
      </div>
      <p className="text-xl font-bold text-slate-900 capitalize">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{desc}</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data,    setData]      = useState<AnalyticsData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState<string | null>(null);
  const [tick,    setTick]      = useState(0);

  useEffect(() => {
    setLoading(true);
    analyticsService.get()
      .then(setData)
      .catch(() => setError('Failed to load analytics. Make sure the backend is running.'))
      .finally(() => setLoading(false));
  }, [tick]);

  const refresh = () => setTick((n) => n + 1);

  // Determine quick insight values
  const busiestDay = data?.weeklyActivity.reduce((a, b) => a.total > b.total ? a : b, data.weeklyActivity[0]);
  const topCat     = data?.byCategory[0];

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Your productivity insights, all in one place</p>
        </div>
        <button onClick={refresh}
          className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
          title="Refresh">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* ── Error ────────────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 font-medium ml-4">Dismiss</button>
        </div>
      )}

      {/* ── KPI Cards ────────────────────────────────────────────────────── */}
      {loading
        ? <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{Array.from({length:8}).map((_,i)=><Skeleton key={i} className="h-28"/>)}</div>
        : data && <KPICards summary={data.summary} />
      }

      {/* ── Score + 30-day Trend ─────────────────────────────────────────── */}
      {loading
        ? <div className="grid lg:grid-cols-5 gap-6"><Skeleton className="h-52 lg:col-span-2"/><Skeleton className="h-52 lg:col-span-3"/></div>
        : data && (
          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2">
              <ScoreGauge
                score={data.summary.productivityScore}
                completionRate={data.summary.completionRate}
                weeklyRate={data.summary.weeklyRate}
                streak={data.summary.streak}
              />
            </div>
            <div className="lg:col-span-3">
              <TrendChart data={data.dailyTrend} />
            </div>
          </div>
        )
      }

      {/* ── Quick Insight Cards ───────────────────────────────────────────── */}
      {data && !loading && (
        <div className="grid sm:grid-cols-4 gap-4">
          <InsightCard emoji="🎯" title="Completion rate"
            value={`${data.summary.completionRate}%`}
            desc={data.summary.completionRate >= 70 ? 'Great consistency — keep it up!' : 'Try completing more scheduled tasks.'}
            positive={data.summary.completionRate >= 70}
          />
          <InsightCard emoji="📅" title="Busiest day"
            value={busiestDay?.day ?? '—'}
            desc={`${busiestDay?.total ?? 0} schedules on average`}
            positive
          />
          <InsightCard emoji="⚡" title="Top category"
            value={topCat?.name?.toLowerCase() ?? 'None yet'}
            desc={`${topCat?.value ?? 0} schedules in this category`}
            positive
          />
          <InsightCard emoji="🔥" title="Current streak"
            value={`${data.summary.streak} day${data.summary.streak !== 1 ? 's' : ''}`}
            desc={data.summary.streak > 0 ? 'Keep the momentum going!' : 'Complete a schedule today to start a streak'}
            positive={data.summary.streak > 0}
          />
        </div>
      )}

      {/* ── Distribution Charts ───────────────────────────────────────────── */}
      {loading
        ? <div className="grid md:grid-cols-3 gap-6">{Array.from({length:3}).map((_,i)=><Skeleton key={i} className="h-72"/>)}</div>
        : data && (
          <div className="grid md:grid-cols-3 gap-6">
            <CategoryDonut data={data.byCategory} />
            <PriorityBar   data={data.byPriority} />
            <StatusDonut   data={data.byStatus}   />
          </div>
        )
      }

      {/* ── Weekly Pattern + Hourly ───────────────────────────────────────── */}
      {loading
        ? <div className="grid md:grid-cols-2 gap-6"><Skeleton className="h-64"/><Skeleton className="h-64"/></div>
        : data && (
          <div className="grid md:grid-cols-2 gap-6">
            <WeeklyChart data={data.weeklyActivity} />
            <HourlyChart data={data.hourlyDistribution} />
          </div>
        )
      }

      {/* ── Divider ──────────────────────────────────────────────────────── */}
      <div className="border-t border-slate-200 pt-2" />

      {/* ── Routine Performance (always rendered, handles its own loading) ── */}
      <RoutineOverviewChart />

    </div>
  );
}
