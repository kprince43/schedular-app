'use client';

import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

interface ScoreGaugeProps {
  score: number;
  completionRate: number;
  weeklyRate: number;
  streak: number;
}

export default function ScoreGauge({ score, completionRate, weeklyRate, streak }: ScoreGaugeProps) {
  const data = [{ value: score, fill: score >= 70 ? '#6366f1' : score >= 40 ? '#f59e0b' : '#ef4444' }];

  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs work';
  const labelColor = score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-blue-600' : score >= 40 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="card p-6">
      <h3 className="font-semibold text-slate-900 mb-4">Productivity Score</h3>
      <div className="flex items-center gap-6">
        {/* Gauge */}
        <div className="relative w-36 h-36 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%" cy="50%"
              innerRadius="70%" outerRadius="100%"
              startAngle={220} endAngle={-40}
              data={data}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar dataKey="value" cornerRadius={8} background={{ fill: '#f1f5f9' }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-slate-900">{score}</span>
            <span className={`text-xs font-semibold mt-0.5 ${labelColor}`}>{label}</span>
          </div>
        </div>

        {/* Metrics */}
        <div className="flex-1 space-y-3">
          {[
            { label: 'All-time completion', value: completionRate, color: 'bg-brand-500' },
            { label: 'This week',           value: weeklyRate,     color: 'bg-emerald-500' },
            { label: 'Streak bonus',        value: Math.min(100, streak * 14), color: 'bg-orange-500' },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-600">{label}</span>
                <span className="font-semibold text-slate-900 tabular-nums">{value}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}
          <p className="text-xs text-slate-400 pt-1">
            🔥 {streak} day{streak !== 1 ? 's' : ''} active streak
          </p>
        </div>
      </div>
    </div>
  );
}
