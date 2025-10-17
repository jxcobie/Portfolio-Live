'use client';

import { useState } from 'react';
import { AdminNavigation } from './components/AdminNavigation';
import { AdminHeader } from './components/AdminHeader';
import './admin-overrides.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="admin-container min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 ${
          sidebarOpen ? 'w-72' : 'w-20'
        }`}
      >
        <AdminNavigation isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-20'}`}>
        {/* Header */}
        <AdminHeader />

        {/* Page Content */}
        <main className="p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
