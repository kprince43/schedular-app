'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  page:       number;
  totalPages: number;
  total:      number;
  limit:      number;
  hasPrev:    boolean;
  hasNext:    boolean;
  onPage:     (p: number) => void;
}

export default function Pagination({ page, totalPages, total, limit, hasPrev, hasNext, onPage }: PaginationProps) {
  if (totalPages <= 1) return null;

  const from  = (page - 1) * limit + 1;
  const to    = Math.min(page * limit, total);

  // Build visible page numbers with ellipsis
  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3)           pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-slate-500">
        Showing <span className="font-medium text-slate-700">{from}–{to}</span> of{' '}
        <span className="font-medium text-slate-700">{total}</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={!hasPrev}
          className="h-8 w-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((p, i) =>
          p === '...'
            ? <span key={`dots-${i}`} className="h-8 w-8 flex items-center justify-center text-slate-400 text-sm">…</span>
            : (
              <button
                key={p}
                onClick={() => onPage(p)}
                className={cn(
                  'h-8 w-8 rounded-lg text-sm font-medium transition-colors',
                  p === page
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                )}
              >
                {p}
              </button>
            )
        )}

        <button
          onClick={() => onPage(page + 1)}
          disabled={!hasNext}
          className="h-8 w-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
