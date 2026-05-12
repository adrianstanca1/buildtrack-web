'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  Clock,
  DollarSign,
  ShieldAlert,
  MessageSquare,
  Wrench,
  TrendingUp,
} from 'lucide-react';

export interface AnalyticsMetrics {
  onTimePercent: number;
  totalTasks: number;
  onTimeTasks: number;
  budget: number;
  spent: number;
  budgetVariance: number;
  totalIncidents: number;
  severeIncidents: number;
  incidentRate: number;
  avgResponseHours: number;
  totalRFIs: number;
  approvedRFIs: number;
  pendingRFIs: number;
  scheduleProgress: number;
  totalSchedules: number;
  completedSchedules: number;
  totalCOs: number;
  costImpact: number;
  daysImpact: number;
}

interface AnalyticsDashboardProps {
  metrics?: AnalyticsMetrics;
  isLoading?: boolean;
}

export function AnalyticsDashboard({ metrics, isLoading }: AnalyticsDashboardProps) {
  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-20 animate-pulse rounded-lg bg-gray-200" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'On-Time Completion',
      value: `${metrics.onTimePercent}%`,
      subtitle: `${metrics.onTimeTasks} / ${metrics.totalTasks} tasks`,
      icon: <Clock className="h-5 w-5 text-blue-600" />,
      color: 'bg-blue-50',
      positive: metrics.onTimePercent >= 80,
    },
    {
      title: 'Budget Variance',
      value: `${metrics.budgetVariance > 0 ? '+' : ''}${metrics.budgetVariance}%`,
      subtitle: `£${(metrics.spent / 1000).toFixed(1)}k / £${(metrics.budget / 1000).toFixed(1)}k`,
      icon: <DollarSign className="h-5 w-5 text-purple-600" />,
      color: 'bg-purple-50',
      positive: metrics.budgetVariance <= 10,
    },
    {
      title: 'Safety Incidents',
      value: String(metrics.totalIncidents),
      subtitle: `${metrics.severeIncidents} severe`,
      icon: <ShieldAlert className="h-5 w-5 text-red-600" />,
      color: 'bg-red-50',
      positive: metrics.totalIncidents === 0,
    },
    {
      title: 'RFI Response Time',
      value: `${metrics.avgResponseHours}h`,
      subtitle: `${metrics.pendingRFIs} pending`,
      icon: <MessageSquare className="h-5 w-5 text-amber-600" />,
      color: 'bg-amber-50',
      positive: metrics.avgResponseHours <= 48,
    },
  ];

  const chartData = [
    { name: 'Tasks', completed: metrics.onTimeTasks, total: metrics.totalTasks },
    { name: 'RFIs', completed: metrics.approvedRFIs, total: metrics.totalRFIs },
    { name: 'Schedules', completed: metrics.completedSchedules, total: metrics.totalSchedules },
  ].filter((d) => d.total > 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardContent className="flex items-start justify-between p-5">
              <div className="min-w-0">
                <p className="text-sm text-gray-500 truncate">{card.title}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-400 mt-1">{card.subtitle}</p>
              </div>
              <div className={`shrink-0 rounded-lg p-2.5 ${card.color}`}>{card.icon}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <TrendingUp className="h-4 w-4" />
              Completion Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  }}
                />
                <Bar dataKey="completed" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={index} fill={['#3b82f6', '#f59e0b', '#10b981'][index % 3]} />
                  ))}
                </Bar>
                <Bar dataKey="total" radius={[4, 4, 0, 0]} fill="#e5e7eb" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {metrics.totalCOs > 0 && (
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-lg bg-orange-50 p-3">
              <Wrench className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Change Order Impact</p>
              <p className="mt-0.5 text-sm text-gray-700">
                <span className="font-semibold">{metrics.totalCOs}</span> approved change orders ·{' '}
                <span className="font-semibold text-red-600">+£{metrics.costImpact.toLocaleString()}</span> cost impact ·{' '}
                <span className="font-semibold text-amber-600">+{metrics.daysImpact} days</span> schedule impact
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
