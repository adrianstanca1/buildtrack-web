'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { ProjectChart } from '@/components/dashboard/ProjectChart';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { RecentTasks } from '@/components/dashboard/RecentTasks';
import RiskDashboard from '@/components/dashboard/RiskDashboard';

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/dashboard/stats');
      return res.data.data;
    },
  });

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await api.get('/projects');
      return res.data.data;
    },
  });

  const { data: tasksData } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await api.get('/tasks');
      return res.data.data;
    },
  });

  const { data: activityData } = useQuery({
    queryKey: ['activity'],
    queryFn: async () => {
      const res = await api.get('/activity');
      return res.data.data;
    },
  });

  const projects = projectsData || [];
  const tasks = tasksData || [];
  const activities = activityData || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <RiskDashboard />
      <StatsCards stats={stats} isLoading={statsLoading} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ProjectChart projects={projects} />
        <ActivityFeed activities={activities} />
      </div>

      <RecentTasks tasks={tasks} />
    </div>
  );
}
