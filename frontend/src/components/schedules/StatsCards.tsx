import { Calendar, CheckCircle2, Clock, Zap } from 'lucide-react';
import { ScheduleStats } from '@/types';

interface StatsCardsProps { stats: ScheduleStats | null; }

export default function StatsCards({ stats }: StatsCardsProps) {
  const completed = stats?.byStatus.find((s) => s.status === 'COMPLETED')?._count ?? 0;
  const pending   = stats?.byStatus.find((s) => s.status === 'PENDING')?._count    ?? 0;
  const inProg    = stats?.byStatus.find((s) => s.status === 'IN_PROGRESS')?._count ?? 0;
  const total     = stats?.byStatus.reduce((a, s) => a + s._count, 0) ?? 0;
  const rate      = total ? Math.round((completed / total) * 100) : 0;

  const cards = [
    { label: 'This week',   value: stats?.thisWeek  ?? '—', sub: 'Scheduled',     icon: Calendar,      color: 'bg-brand-50 text-brand-600' },
    { label: 'Upcoming',    value: stats?.upcoming  ?? '—', sub: 'Active items',   icon: Clock,         color: 'bg-amber-50 text-amber-600' },
    { label: 'In progress', value: inProg,                  sub: `${pending} pending`, icon: Zap,       color: 'bg-blue-50 text-blue-600'   },
    { label: 'Completion',  value: `${rate}%`,              sub: `${completed} of ${total}`, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, sub, icon: Icon, color }) => (
        <div key={label} className="card p-5">
          <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center mb-3`}>
            <Icon className="h-4 w-4" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-xs font-medium text-slate-700 mt-0.5">{label}</p>
          <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
        </div>
      ))}
    </div>
  );
}
