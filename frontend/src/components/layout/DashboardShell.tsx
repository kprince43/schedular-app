'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, CalendarDays, BarChart2, Settings,
  LogOut, Menu, X, Bell, Search, ChevronDown,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { useRequireAuth } from '@/hooks/useAuth';
import { cn, getInitials } from '@/lib/utils';

const navItems = [
  { href: '/dashboard',           icon: LayoutDashboard, label: 'Overview'  },
  { href: '/dashboard/schedules', icon: CalendarDays,    label: 'Schedules' },
  { href: '/dashboard/analytics', icon: BarChart2,       label: 'Analytics' },
  { href: '/dashboard/settings',  icon: Settings,        label: 'Settings'  },
];

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const { isLoading } = useRequireAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => { await logout(); router.replace('/auth/login'); };

  const activeLabel = navItems.find(
    (i) => i.href === pathname || (i.href !== '/dashboard' && pathname.startsWith(i.href))
  )?.label || 'Dashboard';

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-600 animate-pulse" />
          <p className="text-sm text-slate-500">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-slate-900/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0 shadow-glow">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="2" width="7" height="7" rx="2" fill="white"/>
                <rect x="11" y="2" width="7" height="7" rx="2" fill="white" fillOpacity="0.5"/>
                <rect x="2" y="11" width="7" height="7" rx="2" fill="white" fillOpacity="0.5"/>
                <rect x="11" y="11" width="7" height="7" rx="2" fill="white"/>
              </svg>
            </div>
            <span className="font-semibold text-slate-900 text-sm">Scheduler Pro</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs text-slate-400">Search…</span>
            <span className="ml-auto text-xs text-slate-300 font-mono">⌘K</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">Menu</p>
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  isActive ? 'bg-brand-50 text-brand-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-brand-600' : 'text-slate-400')} />
                {label}
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500" />}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-slate-100">
          <button onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {getInitials(user.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
            <ChevronDown className={cn('h-3.5 w-3.5 text-slate-400 transition-transform', userMenuOpen && 'rotate-180')} />
          </button>

          {userMenuOpen && (
            <div className="mt-1 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden animate-fade-in">
              <Link href="/dashboard/settings" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                <Settings className="h-3.5 w-3.5 text-slate-400" />Settings
              </Link>
              <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                <LogOut className="h-3.5 w-3.5" />Sign out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:text-slate-700 -ml-2">
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden sm:block">
            <h2 className="text-sm font-medium text-slate-600">{activeLabel}</h2>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-500 rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-xs font-bold text-white">
              {getInitials(user.name)}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
