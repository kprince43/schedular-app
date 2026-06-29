'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

interface HourlyPoint { hour: string; count: number; }
interface HourlyChartProps { data: HourlyPoint[]; }

export default function HourlyChart({ data }: HourlyChartProps) {
  // Group into 4 time blocks for color coding
  const getColor = (hour: string) => {
    const h = parseInt(hour);
    if (h >= 6  && h < 12) return '#6366f1'; // morning  — brand
    if (h >= 12 && h < 17) return '#10b981'; // afternoon — emerald
    if (h >= 17 && h < 21) return '#f59e0b'; // evening  — amber
    return '#94a3b8';                          // night    — slate
  };

  const peak = data.reduce((a, b) => (b.count > a.count ? b : a), data[0]);

  // Show every 3rd hour label to avoid clutter
  const tickFormatter = (val: string, idx: number) => (idx % 3 === 0 ? val.slice(0, 2) + 'h' : '');

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="font-semibold text-slate-900">Peak Activity Hours</h3>
          <p className="text-xs text-slate-500 mt-0.5">When you schedule most of your work</p>
        </div>
        {peak?.count > 0 && (
          <span className="text-xs font-medium bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full">
            Peak: {peak.hour}
          </span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ left: -20, right: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="hour" tickFormatter={tickFormatter}
            tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            formatter={(v) => [v, 'Schedules']}
            labelFormatter={(l) => `Hour: ${l}`}
            contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={18}>
            {data.map((entry) => (
              <Cell key={entry.hour} fill={getColor(entry.hour)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-3">
        {[
          { label: 'Morning (6–12)',   color: '#6366f1' },
          { label: 'Afternoon (12–17)', color: '#10b981' },
          { label: 'Evening (17–21)',  color: '#f59e0b' },
          { label: 'Night',           color: '#94a3b8' },
        ].map(({ label, color }) => (
          <span key={label} className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: color }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
