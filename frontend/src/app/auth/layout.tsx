import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'Sign In', template: '%s | Scheduler Pro' },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left: Branding panel */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between bg-brand-950 p-12 overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-brand-800/30 blur-3xl" />
          <div className="absolute top-1/2 -right-20 w-80 h-80 rounded-full bg-brand-600/20 blur-3xl" />
          <div className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full bg-indigo-900/40 blur-3xl" />
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center shadow-glow">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="2" width="7" height="7" rx="2" fill="white" />
              <rect x="11" y="2" width="7" height="7" rx="2" fill="white" fillOpacity="0.5" />
              <rect x="2" y="11" width="7" height="7" rx="2" fill="white" fillOpacity="0.5" />
              <rect x="11" y="11" width="7" height="7" rx="2" fill="white" />
            </svg>
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">Scheduler Pro</span>
        </div>

        {/* Main copy */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Your work, <br />
              <span className="text-brand-400">finally organized.</span>
            </h1>
            <p className="mt-4 text-slate-400 text-lg leading-relaxed max-w-sm">
              Plan smarter, track progress, and hit every deadline — all in one place.
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-3">
            {[
              { icon: '📅', text: 'Visual scheduling with drag-and-drop' },
              { icon: '📊', text: 'Real-time productivity analytics' },
              { icon: '✅', text: 'Smart task management & priorities' },
              { icon: '🔔', text: 'Deadline alerts and reminders' },
            ].map(({ icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-slate-300 text-sm">
                <span className="text-base">{icon}</span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Social proof */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {['#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'].map((color, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-brand-900 flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: color }}
                >
                  {['A', 'B', 'C', 'D'][i]}
                </div>
              ))}
            </div>
            <p className="text-slate-400 text-sm">
              <span className="text-white font-semibold">2,400+</span> teams stay on track
            </p>
          </div>
        </div>
      </div>

      {/* Right: Form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-slate-50">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="2" width="7" height="7" rx="2" fill="white" />
                <rect x="11" y="2" width="7" height="7" rx="2" fill="white" fillOpacity="0.5" />
                <rect x="2" y="11" width="7" height="7" rx="2" fill="white" fillOpacity="0.5" />
                <rect x="11" y="11" width="7" height="7" rx="2" fill="white" />
              </svg>
            </div>
            <span className="font-semibold text-slate-900">Scheduler Pro</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
