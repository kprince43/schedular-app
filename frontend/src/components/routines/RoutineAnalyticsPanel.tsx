'use client';

import { X, Flame, Trophy, TrendingUp, CheckCircle2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { RoutineAnalyticsData } from '@/types';
import { cn } from '@/lib/utils';

interface RoutineAnalyticsPanelProps {
  data:    RoutineAnalyticsData;
  onClose: () => void;
}

const dotColor: Record<string, string> = {
  DONE:    'bg-emerald-500',
  SKIPPED: 'bg-amber-400',
  MISSED:  'bg-red-400',
  PENDING: 'bg-slate-200',
  'N/A':   'bg-slate-100',
};

export default function RoutineAnalyticsPanel({ data, onClose }: RoutineAnalyticsPanelProps) {
  const { summary, last30, dowAdherence } = data;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg h-full max-h-[90vh] flex flex-col animate-slide-up overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="font-semibold text-slate-900">{data.routine.title}</h2>
            <p className="text-xs text-slate-500 capitalize mt-0.5">{data.routine.frequency.toLowerCase()} routine</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Adherence',    value: `${summary.adherence}%`, icon: TrendingUp,   color: 'text-brand-600 bg-brand-50' },
              { label: 'Streak',       value: summary.streak,          icon: Flame,        color: 'text-orange-600 bg-orange-50' },
              { label: 'Best streak',  value: summary.bestStreak,      icon: Trophy,       color: 'text-amber-600 bg-amber-50' },
              { label: 'Done',         value: summary.done,            icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="card p-3 text-center">
                <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center mx-auto mb-1.5', color)}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <p className="text-lg font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>

          {/* Breakdown pills */}
          <div className="flex gap-3">
            {[
              { label: 'Done',    value: summary.done,    color: 'bg-emerald-100 text-emerald-700' },
              { label: 'Skipped', value: summary.skipped, color: 'bg-amber-100 text-amber-700' },
              { label: 'Missed',  value: summary.missed,  color: 'bg-red-100 text-red-700' },
            ].map(({ label, value, color }) => (
              <div key={label} className={cn('flex-1 rounded-xl px-3 py-2 text-center', color)}>
                <p className="text-xl font-bold">{value}</p>
                <p className="text-xs font-medium">{label}</p>
              </div>
            ))}
          </div>

          {/* 30-day heatmap */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Last 30 Days</p>
            <div className="flex gap-1 flex-wrap">
              {last30.map(({ date, status }) => (
                <div key={date} title={`${date}: ${status}`}
                  className={cn('w-6 h-6 rounded-md transition-colors cursor-default', dotColor[status] ?? 'bg-slate-200')} />
              ))}
            </div>
            <div className="flex gap-3 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block"/>Done</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-amber-400 inline-block"/>Skipped</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-400 inline-block"/>Missed</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-slate-200 inline-block"/>Pending</span>
            </div>
          </div>

          {/* Day-of-week adherence */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Day-of-Week Adherence</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={dowAdherence} margin={{ left: -20, right: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0,100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip formatter={(v) => [`${v}%`, 'Adherence']}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Bar dataKey="adherence" radius={[5,5,0,0]}>
                  {dowAdherence.map((e) => (
                    <Cell key={e.day} fill={e.adherence >= 80 ? '#10b981' : e.adherence >= 50 ? '#6366f1' : e.adherence > 0 ? '#f59e0b' : '#e2e8f0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
