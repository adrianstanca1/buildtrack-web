'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Building2, ClipboardList, Users, AlertTriangle,
  ClipboardCheck, Bell, Settings, LogOut, Menu, X, Shield,
  BarChart3, CreditCard, CalendarDays, ShoppingCart, Wrench, Clock, Package, FileText, Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/projects', label: 'Projects', icon: Building2 },
  { href: '/dashboard/tasks', label: 'Tasks', icon: ClipboardList },
  { href: '/dashboard/workers', label: 'Workers', icon: Users },
  { href: '/dashboard/safety', label: 'Safety', icon: AlertTriangle },
  { href: '/dashboard/inspections', label: 'Inspections', icon: ClipboardCheck },
  { href: '/dashboard/meetings', label: 'Meetings', icon: CalendarDays },
  { href: '/dashboard/purchase-orders', label: 'Purchase Orders', icon: ShoppingCart },
  { href: '/dashboard/equipment', label: 'Equipment', icon: Wrench },
  { href: '/dashboard/timesheets', label: 'Timesheets', icon: Clock },
  { href: '/dashboard/materials', label: 'Materials', icon: Package },
  { href: '/dashboard/change-orders', label: 'Change Orders', icon: FileText },
  { href: '/dashboard/budget', label: 'Budget', icon: Wallet },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const adminItems = [
  { href: '/dashboard/admin/users', label: 'Users', icon: Shield },
  { href: '/dashboard/admin/billing', label: 'Billing', icon: CreditCard },
  { href: '/dashboard/admin/stats', label: 'Stats', icon: BarChart3 },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-200 ease-in-out lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-6">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              BuildTrack
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <Icon className={cn('h-5 w-5', isActive ? 'text-blue-600' : 'text-gray-400')} />
                  {item.label}
                </Link>
              );
            })}

            <div className="mt-6 mb-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Admin
            </div>
            {adminItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <Icon className={cn('h-5 w-5', isActive ? 'text-blue-600' : 'text-gray-400')} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t p-4">
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50">
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-30 flex h-16 items-center gap-4 bg-white px-4 shadow-sm lg:px-8">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
            <Menu className="h-5 w-5 text-gray-500" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-blue-600"></div>
          </div>
        </div>
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
