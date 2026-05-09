'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { Building2, Users, ClipboardList, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';

function StatCard({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`rounded-lg p-3 ${color}`}>{icon}</div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/dashboard/stats');
      return res.data.data;
    },
  });

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Projects"
          value={stats?.total_projects || 0}
          icon={<Building2 className="h-6 w-6 text-blue-600" />}
          color="bg-blue-50"
        />
        <StatCard
          title="Active Workers"
          value={stats?.active_workers || 0}
          icon={<Users className="h-6 w-6 text-green-600" />}
          color="bg-green-50"
        />
        <StatCard
          title="Pending Tasks"
          value={stats?.pending_tasks || 0}
          icon={<ClipboardList className="h-6 w-6 text-amber-600" />}
          color="bg-amber-50"
        />
        <StatCard
          title="Critical Incidents"
          value={stats?.critical_incidents || 0}
          icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
          color="bg-red-50"
        />
        <StatCard
          title="Total Budget"
          value={formatCurrency(stats?.total_budget || 0)}
          icon={<DollarSign className="h-6 w-6 text-purple-600" />}
          color="bg-purple-50"
        />
        <StatCard
          title="Task Completion"
          value={`${Math.round(((stats?.completed_tasks || 0) / (stats?.total_tasks || 1)) * 100)}%`}
          icon={<TrendingUp className="h-6 w-6 text-teal-600" />}
          color="bg-teal-50"
        />
      </div>
    </div>
  );
}
