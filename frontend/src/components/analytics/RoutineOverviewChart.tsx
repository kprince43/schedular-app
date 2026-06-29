'use client';

import { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { Flame, TrendingUp, CheckCircle2, Repeat2 } from 'lucide-react';
import { routineService } from '@/lib/routineService';
import { RoutineOverviewItem } from '@/types';
import { cn } from '@/lib/utils';

interface OverviewData {
  overview:         RoutineOverviewItem[];
  dailyCompletion:  { date: string; label: string; rate: number }[];
}

function AdherenceBar({ value }: { value: number }) {
  const color = value >= 80 ? 'bg-emerald-500' : value >= 50 ? 'bg-brand-500' : value >= 25 ? 'bg-amber-500' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-500', color)} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs tabular-nums text-slate-600 font-medium w-9 text-right">{value}%</span>
    </div>
  );
}

export default function RoutineOverviewChart() {
  const [data, setData]       = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    routineService.overview()
      .then(setData)
      .catch(() => {/* non-critical */})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 card h-64 animate-pulse bg-slate-50" />
        <div className="lg:col-span-2 card h-64 animate-pulse bg-slate-50" />
      </div>
    );
  }

  if (!data || data.overview.length === 0) {
    return (
      <div className="card p-10 text-center">
        <Repeat2 className="h-8 w-8 text-slate-300 mx-auto mb-3" />
        <p className="font-medium text-slate-700 mb-1">No routine data yet</p>
        <p className="text-sm text-slate-400">
          Head to <a href="/dashboard/routines" className="text-brand-600 hover:underline">Routines</a> to create and track daily habits.
        </p>
      </div>
    );
  }

  const totalActive  = data.overview.filter((r) => r.isActive).length;
  const avgAdherence = data.overview.length
    ? Math.round(data.overview.reduce((a, r) => a + r.adherence, 0) / data.overview.length)
    : 0;
  const topStreak    = Math.max(...data.overview.map((r) => r.streak), 0);
  const totalDone    = data.overview.reduce((a, r) => a + r.done, 0);

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
          <Repeat2 className="h-4 w-4 text-violet-600" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-900">Routine Performance</h2>
          <p className="text-xs text-slate-500">30-day adherence and habit tracking overview</p>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Active routines', value: totalActive,     icon: Repeat2,       color: 'bg-violet-100 text-violet-600' },
          { label: 'Avg adherence',   value: `${avgAdherence}%`, icon: TrendingUp, color: 'bg-brand-100 text-brand-600'   },
          { label: 'Best streak',     value: `${topStreak}d`, icon: Flame,         color: 'bg-orange-100 text-orange-600' },
          { label: 'Total done',      value: totalDone,       icon: CheckCircle2,  color: 'bg-emerald-100 text-emerald-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-3', color)}>
              <Icon className="h-3.5 w-3.5" />
            </div>
            <p className="text-xl font-bold text-slate-900 tabular-nums">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* 30-day daily completion rate */}
        <div className="lg:col-span-3 card p-6">
          <h3 className="font-semibold text-slate-900 mb-1">Daily Routine Completion</h3>
          <p className="text-xs text-slate-500 mb-4">% of active routines completed each day (last 30 days)</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data.dailyCompletion} margin={{ left: -20, right: 4 }}>
              <defs>
                <linearGradient id="routineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label"
                tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                interval={4} />
              <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v) => [`${v}%`, 'Completion rate']}
                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
              />
              <Area type="monotone" dataKey="rate" stroke="#8b5cf6" strokeWidth={2}
                fill="url(#routineGrad)" dot={false} activeDot={{ r: 4, fill: '#8b5cf6' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Per-routine adherence leaderboard */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="font-semibold text-slate-900 mb-1">Routine Adherence</h3>
          <p className="text-xs text-slate-500 mb-4">30-day completion rate per routine</p>
          <div className="space-y-4 overflow-y-auto max-h-52 pr-1 scrollbar-thin">
            {data.overview
              .sort((a, b) => b.adherence - a.adherence)
              .map((r) => (
                <div key={r.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-700 truncate max-w-[140px]">{r.title}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {r.streak > 0 && (
                        <span className="text-xs text-orange-500 flex items-center gap-0.5">
                          <Flame className="h-3 w-3" />{r.streak}
                        </span>
                      )}
                      <span className={cn('text-xs px-1.5 py-0.5 rounded-full font-medium',
                        r.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      )}>
                        {r.isActive ? 'Active' : 'Paused'}
                      </span>
                    </div>
                  </div>
                  <AdherenceBar value={r.adherence} />
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
