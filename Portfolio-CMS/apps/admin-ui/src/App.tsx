import { Suspense } from 'react';
import { Outlet, Link } from 'react-router-dom';

import { LegacyFallback } from './legacy-fallback';

const isModernAdminEnabled = (import.meta.env.VITE_ENABLE_NEW_ADMIN ?? 'false') === 'true';

export default function App() {
  if (!isModernAdminEnabled) {
    return <LegacyFallback />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-primary/80">Portfolio CMS</p>
            <h1 className="text-xl font-semibold">Admin Control Center</h1>
          </div>
          <nav className="flex gap-4 text-sm font-medium">
            <Link to="/dashboard" className="hover:text-primary">
              Dashboard
            </Link>
            <Link to="/messages" className="hover:text-primary">
              Messages
            </Link>
            <Link to="/projects" className="hover:text-primary">
              Projects
            </Link>
            <Link to="/bookings" className="hover:text-primary">
              Bookings
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto flex max-w-6xl flex-1 flex-col gap-6 px-6 py-8">
        <Suspense fallback={<p>Loading view…</p>}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
