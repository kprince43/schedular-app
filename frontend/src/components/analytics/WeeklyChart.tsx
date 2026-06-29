'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { WeeklyActivityPoint } from '@/types';

interface WeeklyChartProps { data: WeeklyActivityPoint[]; }

export default function WeeklyChart({ data }: WeeklyChartProps) {
  return (
    <div className="card p-6">
      <div className="mb-5">
        <h3 className="font-semibold text-slate-900">Weekly Pattern</h3>
        <p className="text-xs text-slate-500 mt-0.5">Completion rate by day of week (last 7 days)</p>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ left: -20, right: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="%" />
          <Tooltip
            formatter={(val) => [`${val}%`, 'Completion']}
            contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
          />
          <Bar dataKey="rate" name="Completion %" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.day}
                fill={entry.rate >= 80 ? '#10b981' : entry.rate >= 50 ? '#6366f1' : entry.rate > 0 ? '#f59e0b' : '#e2e8f0'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />≥80%</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-brand-500 inline-block" />50–79%</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />&lt;50%</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-slate-200 inline-block" />No data</span>
      </div>
    </div>
  );
}
