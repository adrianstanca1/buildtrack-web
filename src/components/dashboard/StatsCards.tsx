'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import {
  Building2,
  Users,
  ClipboardList,
  AlertTriangle,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

interface Stats {
  total_projects: number;
  active_workers: number;
  pending_tasks: number;
  critical_incidents: number;
  total_budget: number;
  completed_tasks: number;
  total_tasks: number;
}

export function StatsCards({ stats, isLoading }: { stats?: Stats; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-16 animate-pulse rounded-lg bg-gray-200" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const items = [
    {
      title: 'Total Projects',
      value: stats?.total_projects || 0,
      icon: <Building2 className="h-6 w-6 text-blue-600" />,
      color: 'bg-blue-50',
    },
    {
      title: 'Active Workers',
      value: stats?.active_workers || 0,
      icon: <Users className="h-6 w-6 text-green-600" />,
      color: 'bg-green-50',
    },
    {
      title: 'Pending Tasks',
      value: stats?.pending_tasks || 0,
      icon: <ClipboardList className="h-6 w-6 text-amber-600" />,
      color: 'bg-amber-50',
    },
    {
      title: 'Critical Incidents',
      value: stats?.critical_incidents || 0,
      icon: <AlertTriangle className="h-6 w-6 text-red-600" />,
      color: 'bg-red-50',
    },
    {
      title: 'Total Budget',
      value: formatCurrency(stats?.total_budget || 0),
      icon: <DollarSign className="h-6 w-6 text-purple-600" />,
      color: 'bg-purple-50',
    },
    {
      title: 'Task Completion',
      value: `${Math.round(
        ((stats?.completed_tasks || 0) / (stats?.total_tasks || 1)) * 100
      )}%`,
      icon: <TrendingUp className="h-6 w-6 text-teal-600" />,
      color: 'bg-teal-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Card key={item.title}>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-gray-500">{item.title}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{item.value}</p>
            </div>
            <div className={`rounded-lg p-3 ${item.color}`}>{item.icon}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
