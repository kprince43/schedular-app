'use client';

import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { ChartDataPoint } from '@/types';

const CATEGORY_COLORS: Record<string, string> = {
  WORK: '#6366f1', PERSONAL: '#10b981', HEALTH: '#f59e0b',
  EDUCATION: '#3b82f6', FINANCE: '#8b5cf6', SOCIAL: '#ec4899', OTHER: '#94a3b8',
};
const PRIORITY_COLORS: Record<string, string> = {
  LOW: '#94a3b8', MEDIUM: '#3b82f6', HIGH: '#f59e0b', URGENT: '#ef4444',
};
const STATUS_COLORS: Record<string, string> = {
  PENDING: '#94a3b8', IN_PROGRESS: '#3b82f6', COMPLETED: '#10b981', CANCELLED: '#ef4444',
};

const label = (str: string) => str.charAt(0) + str.slice(1).toLowerCase().replace(/_/g, ' ');

interface CategoryChartProps { data: ChartDataPoint[]; }
interface PriorityChartProps { data: ChartDataPoint[]; }
interface StatusChartProps   { data: ChartDataPoint[]; }

export function CategoryDonut({ data }: CategoryChartProps) {
  if (!data.length) return <EmptyChart title="Category Breakdown" />;
  return (
    <div className="card p-6">
      <h3 className="font-semibold text-slate-900 mb-1">Category Breakdown</h3>
      <p className="text-xs text-slate-500 mb-4">Distribution by category</p>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
            dataKey="value" nameKey="name" paddingAngle={3}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#94a3b8'} />
            ))}
          </Pie>
          <Tooltip formatter={(v, n) => [v, label(String(n))]}
            contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
          <Legend formatter={(v) => label(v)} wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PriorityBar({ data }: PriorityChartProps) {
  if (!data.length) return <EmptyChart title="Priority Distribution" />;
  const enriched = data.map((d) => ({ ...d, fill: PRIORITY_COLORS[d.name] || '#94a3b8', label: label(d.name) }));
  return (
    <div className="card p-6">
      <h3 className="font-semibold text-slate-900 mb-1">Priority Distribution</h3>
      <p className="text-xs text-slate-500 mb-4">Schedules by priority level</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={enriched} margin={{ left: -20, right: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
          <Bar dataKey="value" name="Schedules" radius={[6, 6, 0, 0]}>
            {enriched.map((e) => <Cell key={e.name} fill={e.fill} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StatusDonut({ data }: StatusChartProps) {
  if (!data.length) return <EmptyChart title="Status Overview" />;
  return (
    <div className="card p-6">
      <h3 className="font-semibold text-slate-900 mb-1">Status Overview</h3>
      <p className="text-xs text-slate-500 mb-4">Current state of all schedules</p>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
            dataKey="value" nameKey="name" paddingAngle={3}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
            ))}
          </Pie>
          <Tooltip formatter={(v, n) => [v, label(String(n))]}
            contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
          <Legend formatter={(v) => label(v)} wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function EmptyChart({ title }: { title: string }) {
  return (
    <div className="card p-6 flex flex-col items-center justify-center h-[280px]">
      <p className="font-semibold text-slate-900 mb-1">{title}</p>
      <p className="text-sm text-slate-400">No data yet — create some schedules!</p>
    </div>
  );
}
