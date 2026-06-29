'use client';

import { CheckCircle2, MinusCircle, XCircle, Clock, ChevronRight } from 'lucide-react';
import { TodayRoutine, RoutineLogStatus } from '@/types';
import { cn } from '@/lib/utils';

interface TodayCheckInProps {
  routines:  TodayRoutine[];
  isLoading: boolean;
  onLog:     (id: string, status: RoutineLogStatus) => void;
}

const statusConfig = {
  DONE:    { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 border-emerald-200',  label: 'Done'    },
  SKIPPED: { icon: MinusCircle,  color: 'text-amber-500',   bg: 'bg-amber-50 border-amber-200',      label: 'Skipped' },
  MISSED:  { icon: XCircle,      color: 'text-red-500',     bg: 'bg-red-50 border-red-200',           label: 'Missed'  },
  PENDING: { icon: Clock,        color: 'text-slate-400',   bg: 'bg-white border-slate-200',          label: 'Pending' },
};

const freqLabel: Record<string, string> = {
  DAILY: 'Every day', WEEKDAYS: 'Mon–Fri', WEEKENDS: 'Sat–Sun', WEEKLY: 'Weekly',
};

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 p-3">
      <div className="w-9 h-9 rounded-xl bg-slate-100 animate-pulse shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-2/5 bg-slate-100 rounded animate-pulse" />
        <div className="h-3 w-1/4 bg-slate-100 rounded animate-pulse" />
      </div>
      <div className="flex gap-1.5">
        {Array.from({length:3}).map((_,i)=><div key={i} className="w-8 h-8 rounded-lg bg-slate-100 animate-pulse"/>)}
      </div>
    </div>
  );
}

export default function TodayCheckIn({ routines, isLoading, onLog }: TodayCheckInProps) {
  const done    = routines.filter((r) => r.todayStatus === 'DONE').length;
  const total   = routines.length;
  const pct     = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="card">
      {/* Header */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-slate-900">Today&apos;s Routines</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isLoading ? '…' : `${done} of ${total} completed`}
            </p>
          </div>
          {!isLoading && total > 0 && (
            <span className={cn('text-sm font-bold tabular-nums',
              pct === 100 ? 'text-emerald-600' : pct >= 50 ? 'text-brand-600' : 'text-slate-500')}>
              {pct}%
            </span>
          )}
        </div>

        {/* Progress bar */}
        {!isLoading && total > 0 && (
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500',
                pct === 100 ? 'bg-emerald-500' : 'bg-brand-500')}
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
      </div>

      {/* List */}
      <div className="divide-y divide-slate-50">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
          : total === 0
          ? (
            <div className="p-8 text-center">
              <p className="text-sm text-slate-500">No routines scheduled for today</p>
              <p className="text-xs text-slate-400 mt-1">Create routines to start tracking your habits</p>
            </div>
          )
          : routines.map((r) => {
            const status = statusConfig[r.todayStatus];
            const StatusIcon = status.icon;
            return (
              <div key={r.id} className={cn('flex items-center gap-3 px-4 py-3 transition-colors', r.todayStatus === 'DONE' && 'bg-emerald-50/30')}>
                {/* Status icon */}
                <div className={cn('w-9 h-9 rounded-xl border flex items-center justify-center shrink-0', status.bg)}>
                  <StatusIcon className={cn('h-4.5 w-4.5', status.color)} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-medium truncate', r.todayStatus === 'DONE' ? 'text-slate-400 line-through' : 'text-slate-800')}>
                    {r.title}
                  </p>
                  <p className="text-xs text-slate-400">{r.startTime} – {r.endTime} · {freqLabel[r.frequency]}</p>
                </div>

                {/* Action buttons */}
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => onLog(r.id, 'DONE')}
                    title="Mark done"
                    className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all border',
                      r.todayStatus === 'DONE'
                        ? 'bg-emerald-100 border-emerald-200 text-emerald-600'
                        : 'border-slate-200 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'
                    )}
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => onLog(r.id, 'SKIPPED')}
                    title="Skip"
                    className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all border',
                      r.todayStatus === 'SKIPPED'
                        ? 'bg-amber-100 border-amber-200 text-amber-600'
                        : 'border-slate-200 text-slate-400 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200'
                    )}
                  >
                    –
                  </button>
                  <button
                    onClick={() => onLog(r.id, 'MISSED')}
                    title="Missed"
                    className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all border',
                      r.todayStatus === 'MISSED'
                        ? 'bg-red-100 border-red-200 text-red-600'
                        : 'border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                    )}
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })
        }
      </div>
    </div>
  );
}
