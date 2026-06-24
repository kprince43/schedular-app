'use client';

import { Pencil, Trash2, MoreVertical, Calendar } from 'lucide-react';
import { useState } from 'react';
import { Schedule } from '@/types';
import { StatusBadge, PriorityBadge, CategoryBadge } from '@/components/ui/badges';
import { cn } from '@/lib/utils';

interface ScheduleTableProps {
  schedules:  Schedule[];
  isLoading:  boolean;
  onEdit:     (s: Schedule) => void;
  onDelete:   (s: Schedule) => void;
}

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });

const formatDuration = (start: string, end: string) => {
  const diff = (new Date(end).getTime() - new Date(start).getTime()) / 60000;
  if (diff < 60)  return `${diff}m`;
  if (diff < 1440) return `${Math.round(diff / 60)}h`;
  return `${Math.round(diff / 1440)}d`;
};

function RowMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 w-36 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden animate-fade-in">
            <button
              onClick={() => { onEdit(); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Pencil className="h-3.5 w-3.5 text-slate-400" />
              Edit
            </button>
            <button
              onClick={() => { onDelete(); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Skeleton row for loading state
function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-slate-100 rounded-full animate-pulse" style={{ width: `${[60,40,25,30,25,35,20][i]}%` }} />
        </td>
      ))}
    </tr>
  );
}

export default function ScheduleTable({ schedules, isLoading, onEdit, onDelete }: ScheduleTableProps) {
  const cols = ['Title', 'Category', 'Priority', 'Status', 'Duration', 'Start Time', ''];

  if (!isLoading && schedules.length === 0) {
    return (
      <div className="card p-16 text-center">
        <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
          <Calendar className="h-6 w-6 text-brand-600" />
        </div>
        <h3 className="font-semibold text-slate-900 mb-1">No schedules found</h3>
        <p className="text-sm text-slate-500">Create your first schedule or adjust your filters</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              {cols.map((col) => (
                <th key={col} className={cn(
                  'px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap',
                  col === '' && 'w-12'
                )}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              : schedules.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="px-4 py-3.5 max-w-[220px]">
                    <p className="font-medium text-slate-800 truncate">{s.title}</p>
                    {s.description && (
                      <p className="text-xs text-slate-400 truncate mt-0.5">{s.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <CategoryBadge category={s.category} />
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <PriorityBadge priority={s.priority} />
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 tabular-nums">
                    {formatDuration(s.startTime, s.endTime)}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 tabular-nums text-xs">
                    {formatDateTime(s.startTime)}
                  </td>
                  <td className="px-4 py-3.5">
                    <RowMenu onEdit={() => onEdit(s)} onDelete={() => onDelete(s)} />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
