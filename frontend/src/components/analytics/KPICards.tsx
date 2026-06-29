import { CheckCircle2, XCircle, Clock, TrendingUp, Zap, Flame, Calendar, BarChart2 } from 'lucide-react';
import { AnalyticsSummary } from '@/types';
import { cn } from '@/lib/utils';

interface KPICardsProps { summary: AnalyticsSummary; }

export default function KPICards({ summary }: KPICardsProps) {
  const cards = [
    {
      label: 'Total Schedules', value: summary.total,
      icon: Calendar, color: 'bg-slate-100 text-slate-600',
      sub: 'All time',
    },
    {
      label: 'Completed', value: summary.completed,
      icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-600',
      sub: `${summary.completionRate}% rate`,
    },
    {
      label: 'Pending', value: summary.pending,
      icon: Clock, color: 'bg-amber-100 text-amber-600',
      sub: `${summary.inProgress} in progress`,
    },
    {
      label: 'Missed / Cancelled', value: summary.missed + summary.cancelled,
      icon: XCircle, color: 'bg-red-100 text-red-600',
      sub: `${summary.missed} overdue`,
    },
    {
      label: 'Weekly Rate', value: `${summary.weeklyRate}%`,
      icon: TrendingUp, color: 'bg-blue-100 text-blue-600',
      sub: 'Last 7 days',
    },
    {
      label: 'Productivity', value: `${summary.productivityScore}`,
      icon: Zap, color: 'bg-violet-100 text-violet-600',
      sub: 'Score / 100',
    },
    {
      label: 'Streak', value: summary.streak,
      icon: Flame, color: 'bg-orange-100 text-orange-600',
      sub: summary.streak === 1 ? 'day' : 'days',
    },
    {
      label: 'Completion Rate', value: `${summary.completionRate}%`,
      icon: BarChart2, color: 'bg-brand-100 text-brand-600',
      sub: 'All time',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {cards.map(({ label, value, icon: Icon, color, sub }) => (
        <div key={label} className="card p-5 hover:shadow-md transition-shadow">
          <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', color)}>
            <Icon className="h-4 w-4" />
          </div>
          <p className="text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
          <p className="text-xs font-medium text-slate-700 mt-0.5">{label}</p>
          <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
        </div>
      ))}
    </div>
  );
}
