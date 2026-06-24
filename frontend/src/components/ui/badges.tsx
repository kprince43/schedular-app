import { cn } from '@/lib/utils';
import { Priority, ScheduleStatus, ScheduleCategory } from '@/types';

// ── Priority badge ─────────────────────────────────────────────────────────────
const priorityMap: Record<Priority, { label: string; className: string }> = {
  LOW:    { label: 'Low',    className: 'bg-slate-100 text-slate-600' },
  MEDIUM: { label: 'Medium', className: 'bg-blue-100 text-blue-700' },
  HIGH:   { label: 'High',   className: 'bg-orange-100 text-orange-700' },
  URGENT: { label: 'Urgent', className: 'bg-red-100 text-red-700' },
};

const statusMap: Record<ScheduleStatus, { label: string; className: string; dot: string }> = {
  PENDING:     { label: 'Pending',     className: 'bg-slate-100 text-slate-600',    dot: 'bg-slate-400' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-blue-100 text-blue-700',      dot: 'bg-blue-500' },
  COMPLETED:   { label: 'Completed',   className: 'bg-emerald-100 text-emerald-700',dot: 'bg-emerald-500' },
  CANCELLED:   { label: 'Cancelled',   className: 'bg-red-100 text-red-600',        dot: 'bg-red-400' },
};

const categoryMap: Record<ScheduleCategory, { label: string; emoji: string }> = {
  WORK:      { label: 'Work',      emoji: '💼' },
  PERSONAL:  { label: 'Personal',  emoji: '🏠' },
  HEALTH:    { label: 'Health',    emoji: '❤️' },
  EDUCATION: { label: 'Education', emoji: '📚' },
  FINANCE:   { label: 'Finance',   emoji: '💰' },
  SOCIAL:    { label: 'Social',    emoji: '👥' },
  OTHER:     { label: 'Other',     emoji: '📌' },
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const { label, className } = priorityMap[priority] ?? priorityMap.MEDIUM;
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', className)}>
      {label}
    </span>
  );
}

export function StatusBadge({ status }: { status: ScheduleStatus }) {
  const { label, className, dot } = statusMap[status] ?? statusMap.PENDING;
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium', className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', dot)} />
      {label}
    </span>
  );
}

export function CategoryBadge({ category }: { category: ScheduleCategory }) {
  const { label, emoji } = categoryMap[category] ?? categoryMap.OTHER;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
      <span>{emoji}</span>
      {label}
    </span>
  );
}

// Export maps for use in forms/filters
export { priorityMap, statusMap, categoryMap };
