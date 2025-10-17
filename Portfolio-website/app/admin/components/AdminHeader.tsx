'use client';

import { useState } from 'react';
import { Bell, Search, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function AdminHeader() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Search */}
          <div className="flex max-w-md flex-1 items-center">
            <div className="relative w-full">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                type="text"
                placeholder="Search anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border-gray-200 bg-gray-50 py-2 pr-4 pl-10 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative rounded-xl p-2 hover:bg-gray-100">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500">
                <span className="text-xs font-medium text-white">2</span>
              </span>
            </Button>

            {/* Quick Settings */}
            <Button variant="ghost" size="sm" className="rounded-xl p-2 hover:bg-gray-100">
              <Settings className="h-5 w-5 text-gray-600" />
            </Button>

            {/* User Profile */}
            <div className="flex items-center space-x-3 border-l border-gray-200 pl-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600">
                <User className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
