'use client';

import { CheckSquare, Calendar, Clock, TrendingUp, ArrowRight, Circle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const stats = [
  { label: 'Tasks completed', value: '24', change: '+12%', trend: 'up', icon: CheckSquare, color: 'bg-emerald-50 text-emerald-600' },
  { label: 'Upcoming events', value: '8', change: 'This week', trend: 'neutral', icon: Calendar, color: 'bg-blue-50 text-blue-600' },
  { label: 'Hours tracked', value: '38.5', change: '+4h vs last week', trend: 'up', icon: Clock, color: 'bg-violet-50 text-violet-600' },
  { label: 'Productivity score', value: '87%', change: '+3pts', trend: 'up', icon: TrendingUp, color: 'bg-amber-50 text-amber-600' },
];

const recentTasks = [
  { id: '1', title: 'Finalize Q3 project proposal', status: 'IN_PROGRESS', priority: 'HIGH', due: 'Today' },
  { id: '2', title: 'Review team performance metrics', status: 'TODO', priority: 'MEDIUM', due: 'Tomorrow' },
  { id: '3', title: 'Update documentation for API v2', status: 'TODO', priority: 'LOW', due: 'Jun 25' },
  { id: '4', title: 'Client presentation prep', status: 'DONE', priority: 'URGENT', due: 'Jun 19' },
];

const upcomingEvents = [
  { id: '1', title: 'Weekly team standup', time: '9:00 AM', duration: '30 min', color: '#6366f1' },
  { id: '2', title: 'Product roadmap review', time: '2:00 PM', duration: '1 hr', color: '#10b981' },
  { id: '3', title: '1:1 with manager', time: '4:30 PM', duration: '30 min', color: '#f59e0b' },
];

const priorityConfig: Record<string, { label: string; className: string }> = {
  URGENT: { label: 'Urgent', className: 'bg-red-100 text-red-700' },
  HIGH: { label: 'High', className: 'bg-orange-100 text-orange-700' },
  MEDIUM: { label: 'Medium', className: 'bg-amber-100 text-amber-700' },
  LOW: { label: 'Low', className: 'bg-slate-100 text-slate-600' },
};

const statusConfig: Record<string, { label: string; icon: React.ReactNode }> = {
  TODO: { label: 'To do', icon: <Circle className="h-3 w-3 text-slate-400" /> },
  IN_PROGRESS: { label: 'In progress', icon: <Circle className="h-3 w-3 text-blue-500 fill-blue-500" /> },
  DONE: { label: 'Done', icon: <CheckSquare className="h-3 w-3 text-emerald-500" /> },
  CANCELLED: { label: 'Cancelled', icon: <AlertTriangle className="h-3 w-3 text-slate-400" /> },
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const firstName = user?.name.split(' ')[0] || 'there';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {greeting}, {firstName} 👋
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link
          href="/dashboard/tasks"
          className="hidden sm:flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors shadow-sm"
        >
          New task
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, change, trend, icon: Icon, color }) => (
          <div key={label} className="card p-5 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className={cn('p-2.5 rounded-xl', color)}>
                <Icon className="h-4 w-4" />
              </div>
              {trend === 'up' && (
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {change}
                </span>
              )}
              {trend === 'neutral' && (
                <span className="text-xs text-slate-500">{change}</span>
              )}
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Recent tasks */}
        <div className="lg:col-span-3 card">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Recent Tasks</h2>
            <Link href="/dashboard/tasks" className="text-xs text-brand-600 font-medium hover:text-brand-700 transition-colors flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentTasks.map((task) => {
              const status = statusConfig[task.status];
              const priority = priorityConfig[task.priority];
              return (
                <div key={task.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                  <div className="shrink-0">{status.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-medium text-slate-800 truncate', task.status === 'DONE' && 'line-through text-slate-400')}>
                      {task.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">Due {task.due}</p>
                  </div>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium shrink-0', priority.className)}>
                    {priority.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Today's schedule */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Today&apos;s Schedule</h2>
            <Link href="/dashboard/calendar" className="text-xs text-brand-600 font-medium hover:text-brand-700 transition-colors flex items-center gap-1">
              Calendar <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="p-4 space-y-3">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div
                  className="w-1 h-full min-h-[2.5rem] rounded-full shrink-0 mt-0.5"
                  style={{ backgroundColor: event.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{event.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{event.time} · {event.duration}</p>
                </div>
              </div>
            ))}

            {/* Add event prompt */}
            <button className="w-full text-center py-3 text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl hover:border-brand-300 hover:text-brand-600 transition-colors">
              + Add event
            </button>
          </div>
        </div>
      </div>

      {/* Progress section */}
      <div className="card p-5">
        <h2 className="font-semibold text-slate-900 mb-4">Weekly Progress</h2>
        <div className="grid grid-cols-7 gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
            const heights = [65, 80, 45, 90, 70, 30, 0];
            const isToday = i === 3;
            return (
              <div key={day} className="flex flex-col items-center gap-2">
                <div className="w-full h-24 bg-slate-100 rounded-lg relative overflow-hidden">
                  <div
                    className={cn('absolute bottom-0 w-full rounded-lg transition-all', isToday ? 'bg-brand-500' : 'bg-brand-200')}
                    style={{ height: `${heights[i]}%` }}
                  />
                </div>
                <span className={cn('text-xs font-medium', isToday ? 'text-brand-600' : 'text-slate-400')}>
                  {day}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-slate-500">Completion rate this week</p>
          <p className="text-xs font-semibold text-brand-600">68% avg</p>
        </div>
      </div>
    </div>
  );
}
