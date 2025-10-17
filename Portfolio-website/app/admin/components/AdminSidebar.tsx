'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  FolderOpen,
  Mail,
  BarChart3,
  Settings,
  LogOut,
  User,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/admin',
    exact: true,
  },
  {
    title: 'Projects',
    icon: FolderOpen,
    href: '/admin/projects',
  },
  {
    title: 'Messages',
    icon: Mail,
    href: '/admin/messages',
  },
  {
    title: 'Analytics',
    icon: BarChart3,
    href: '/admin/analytics',
  },
  {
    title: 'Settings',
    icon: Settings,
    href: '/admin/settings',
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact = false) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <Sidebar className="border-r bg-slate-900 text-white">
      <SidebarHeader className="border-b border-slate-700 px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600">
            <User className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Admin Panel</h2>
            <p className="text-sm text-slate-400">Content Management</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-slate-900">
        <SidebarMenu className="px-2 py-4">
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.href, item.exact)}
                className="text-slate-300 hover:bg-slate-800 hover:text-white data-[active=true]:bg-blue-600 data-[active=true]:text-white"
              >
                <Link href={item.href} className="flex items-center gap-3 px-3 py-2">
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-700 bg-slate-900 p-4">
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
            asChild
          >
            <Link href="/" target="_blank">
              <Globe className="mr-2 h-4 w-4" />
              View Site
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-400 hover:bg-slate-800 hover:text-white"
            onClick={() => {
              // Handle logout or navigate back
              window.location.href = '/';
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Exit Admin
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
