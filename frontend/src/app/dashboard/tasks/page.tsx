'use client';

import { CheckSquare, Plus } from 'lucide-react';

export default function TasksPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and track your work</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors shadow-sm">
          <Plus className="h-4 w-4" />
          New task
        </button>
      </div>

      <div className="card p-16 text-center">
        <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
          <CheckSquare className="h-6 w-6 text-brand-600" />
        </div>
        <h3 className="font-semibold text-slate-900 mb-1">No tasks yet</h3>
        <p className="text-sm text-slate-500 mb-4">Create your first task to get started</p>
        <button className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors">
          <Plus className="h-4 w-4" />
          Create task
        </button>
      </div>
    </div>
  );
}
