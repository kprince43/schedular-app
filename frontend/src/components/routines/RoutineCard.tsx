'use client';

import { Pencil, Trash2, Flame, TrendingUp, ToggleLeft, ToggleRight } from 'lucide-react';
import { Routine, RoutineLog } from '@/types';
import { CategoryBadge } from '@/components/ui/badges';
import { cn } from '@/lib/utils';

interface RoutineCardProps {
  routine:   Routine;
  onEdit:    () => void;
  onDelete:  () => void;
  onToggle:  () => void;
}

const logColor: Record<string, string> = {
  DONE:    'bg-emerald-500',
  SKIPPED: 'bg-amber-400',
  MISSED:  'bg-red-400',
  PENDING: 'bg-slate-200',
  'N/A':   'bg-slate-100',
};

const freqLabel: Record<string, string> = {
  DAILY: 'Every day', WEEKDAYS: 'Mon–Fri', WEEKENDS: 'Sat–Sun', WEEKLY: 'Custom days',
};

// Build last-30-days dot map from logs
function buildDots(logs: RoutineLog[] = []): { date: string; status: string }[] {
  const logMap = new Map(logs.map((l) => [l.date.slice(0, 10), l.status]));
  const dots = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dots.push({ date: key, status: logMap.get(key) ?? 'PENDING' });
  }
  return dots;
}

export default function RoutineCard({ routine, onEdit, onDelete, onToggle }: RoutineCardProps) {
  const logs  = routine.logs ?? [];
  const dots  = buildDots(logs);
  const done  = logs.filter((l) => l.status === 'DONE').length;
  const total = logs.length;
  const adherence = total > 0 ? Math.round((done / total) * 100) : 0;

  // Current streak
  let streak = 0;
  const doneSet = new Set(logs.filter((l) => l.status === 'DONE').map((l) => l.date.slice(0, 10)));
  const d = new Date();
  while (doneSet.has(d.toISOString().slice(0, 10))) { streak++; d.setDate(d.getDate() - 1); }

  return (
    <div className={cn('card p-5 transition-all hover:shadow-md', !routine.isActive && 'opacity-60')}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-slate-900 truncate">{routine.title}</h3>
            {!routine.isActive && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">Paused</span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <CategoryBadge category={routine.category} />
            <span className="text-xs text-slate-400">{freqLabel[routine.frequency]}</span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-400">{routine.startTime} – {routine.endTime}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onToggle} title={routine.isActive ? 'Pause' : 'Resume'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors">
            {routine.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
          </button>
          <button onClick={onEdit} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 30-day dot heatmap */}
      <div className="flex gap-0.5 flex-wrap mb-3">
        {dots.map(({ date, status }) => (
          <div key={date} title={`${date}: ${status}`}
            className={cn('w-3 h-3 rounded-sm transition-colors', logColor[status] ?? 'bg-slate-200')} />
        ))}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-xs text-slate-500 border-t border-slate-100 pt-3">
        <span className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3 text-brand-500" />
          <span className="font-semibold text-slate-800">{adherence}%</span> adherence
        </span>
        <span className="flex items-center gap-1">
          <Flame className="h-3 w-3 text-orange-500" />
          <span className="font-semibold text-slate-800">{streak}</span> day streak
        </span>
        <span className="ml-auto">
          <span className="font-semibold text-slate-800">{done}</span>/{total} done (30d)
        </span>
      </div>
    </div>
  );
}
