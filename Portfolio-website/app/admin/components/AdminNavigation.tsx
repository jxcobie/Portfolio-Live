'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutGrid,
  FileText,
  MessageSquare,
  BarChart2,
  Settings,
  ChevronLeft,
  Home,
  LogOut,
} from 'lucide-react';

interface AdminNavigationProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutGrid },
  { name: 'Projects', href: '/admin/projects', icon: FileText },
  { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart2 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminNavigation({ isOpen, onToggle }: AdminNavigationProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="h-full border-r border-gray-200 bg-white shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 p-6">
        {isOpen && (
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600">
              <LayoutGrid className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AdminHub</h1>
              <p className="text-xs text-gray-500">Management Portal</p>
            </div>
          </div>
        )}
        <button onClick={onToggle} className="rounded-lg p-2 transition-colors hover:bg-gray-100">
          <ChevronLeft
            className={`h-5 w-5 text-gray-600 transition-transform ${
              isOpen ? 'rotate-0' : 'rotate-180'
            }`}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="space-y-2 p-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center rounded-xl px-4 py-3 transition-all duration-200 ${
                active
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
              }`}
            >
              <Icon
                className={`h-5 w-5 ${isOpen ? 'mr-3' : 'mx-auto'} ${
                  active ? 'text-white' : 'text-gray-500 group-hover:text-indigo-600'
                }`}
              />
              {isOpen && <span className="font-medium">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="absolute right-0 bottom-6 left-0 space-y-2 px-4">
        <Link
          href="/"
          className={`group flex items-center rounded-xl px-4 py-3 text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:text-indigo-600`}
        >
          <Home
            className={`h-5 w-5 ${isOpen ? 'mr-3' : 'mx-auto'} text-gray-500 group-hover:text-indigo-600`}
          />
          {isOpen && <span className="font-medium">View Site</span>}
        </Link>
        <button
          onClick={() => (window.location.href = '/')}
          className={`group flex w-full items-center rounded-xl px-4 py-3 text-gray-700 transition-all duration-200 hover:bg-red-50 hover:text-red-600`}
        >
          <LogOut
            className={`h-5 w-5 ${isOpen ? 'mr-3' : 'mx-auto'} text-gray-500 group-hover:text-red-600`}
          />
          {isOpen && <span className="font-medium">Sign Out</span>}
        </button>
      </div>
    </div>
  );
}
