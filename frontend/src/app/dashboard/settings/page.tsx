'use client';

import { useAuthStore } from '@/lib/store';
import { getInitials, formatDate } from '@/lib/utils';

export default function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account and preferences</p>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-slate-900 mb-5">Profile</h2>
        <div className="flex items-center gap-5 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center text-xl font-bold text-white">
            {user ? getInitials(user.name) : '??'}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{user?.name}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <p className="text-xs text-slate-400 mt-1">
              Member since {user ? formatDate(user.createdAt) : '—'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="form-label">Full name</label>
            <input type="text" defaultValue={user?.name} className="form-input" />
          </div>
          <div>
            <label className="form-label">Email address</label>
            <input type="email" defaultValue={user?.email} className="form-input" disabled />
            <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors">
            Save changes
          </button>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-slate-900 mb-1">Account</h2>
        <p className="text-sm text-slate-500 mb-5">Manage your plan and billing</p>
        <div className="flex items-center justify-between p-4 rounded-xl bg-brand-50 border border-brand-100">
          <div>
            <p className="text-sm font-semibold text-brand-800">Free plan</p>
            <p className="text-xs text-brand-600 mt-0.5">Up to 50 tasks and 10 events/month</p>
          </div>
          <button className="text-xs font-semibold text-brand-700 hover:text-brand-800 bg-white border border-brand-200 px-3 py-1.5 rounded-lg transition-colors">
            Upgrade
          </button>
        </div>
      </div>
    </div>
  );
}
