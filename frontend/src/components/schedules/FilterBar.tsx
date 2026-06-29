'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { ScheduleFilters, ScheduleCategory, ScheduleStatus, Priority } from '@/types';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  filters:    ScheduleFilters;
  onChange:   (f: ScheduleFilters) => void;
  total:      number;
}

export default function FilterBar({ filters, onChange, total }: FilterBarProps) {
  const [search, setSearch] = useState(filters.search || '');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Debounce search
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      onChange({ ...filters, search: search || undefined });
    }, 350);
    return () => { if (timer.current) clearTimeout(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const set = (key: keyof ScheduleFilters, val: string) =>
    onChange({ ...filters, [key]: val || undefined });

  const clearAll = () => {
    setSearch('');
    onChange({});
  };

  const hasActive = !!(filters.status || filters.category || filters.priority || filters.search);

  const Select = ({
    value, onChange: onChg, placeholder, children,
  }: { value?: string; onChange: (v: string) => void; placeholder: string; children: React.ReactNode }) => (
    <div className="relative">
      <select
        value={value || ''}
        onChange={(e) => onChg(e.target.value)}
        className={cn(
          'appearance-none h-9 pl-3 pr-8 rounded-xl border text-sm transition-all outline-none',
          'bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500',
          value ? 'border-brand-400 text-brand-700 bg-brand-50 font-medium' : 'border-slate-200 text-slate-600',
        )}
      >
        <option value="">{placeholder}</option>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
    </div>
  );

  return (
    <div className="card p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search schedules…"
            className="w-full h-9 pl-9 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Quick filters */}
        <Select value={filters.status} onChange={(v) => set('status', v)} placeholder="All statuses">
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </Select>

        <Select value={filters.category} onChange={(v) => set('category', v)} placeholder="All categories">
          {(['WORK','PERSONAL','HEALTH','EDUCATION','FINANCE','SOCIAL','OTHER'] as ScheduleCategory[]).map((c) => (
            <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>
          ))}
        </Select>

        <Select value={filters.priority} onChange={(v) => set('priority', v)} placeholder="All priorities">
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </Select>

        {/* Sort */}
        <Select value={filters.sortBy} onChange={(v) => set('sortBy', v)} placeholder="Sort by">
          <option value="createdAt">Created</option>
          <option value="startTime">Start time</option>
          <option value="title">Title</option>
          <option value="priority">Priority</option>
        </Select>

        <button
          onClick={() => onChange({ ...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })}
          className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {filters.sortOrder === 'asc' ? 'Asc' : 'Desc'}
        </button>

        {hasActive && (
          <button onClick={clearAll} className="h-9 px-3 rounded-xl border border-red-200 bg-red-50 text-sm text-red-600 hover:bg-red-100 transition-colors flex items-center gap-1.5">
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Advanced: date range */}
      <div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors"
        >
          <ChevronDown className={cn('h-3 w-3 transition-transform', showAdvanced && 'rotate-180')} />
          Date range filter
        </button>

        {showAdvanced && (
          <div className="mt-3 flex flex-wrap gap-3 animate-fade-in">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">From</label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => set('startDate', e.target.value)}
                className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">To</label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => set('endDate', e.target.value)}
                className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>
          </div>
        )}
      </div>

      {/* Result count */}
      <p className="text-xs text-slate-400">
        {total} schedule{total !== 1 ? 's' : ''} found
        {hasActive && ' (filtered)'}
      </p>
    </div>
  );
}
