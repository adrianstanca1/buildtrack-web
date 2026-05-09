'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  ArrowLeft,
  TrendingUp,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface Project {
  id: string;
  name: string;
  description: string;
  location: string;
  status: string;
  progress: number;
  budget: number;
  spent: number;
  start_date: string;
  end_date: string;
}

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string;
}

const statusColors: Record<string, string> = {
  planning: 'bg-gray-100 text-gray-700',
  active: 'bg-blue-100 text-blue-700',
  'on-hold': 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function ProjectDetailPage() {
  const { id } = useParams();

  const { data: projectData } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const res = await api.get(`/projects/${id}`);
      return res.data.data;
    },
  });

  const { data: tasksData } = useQuery({
    queryKey: ['project-tasks', id],
    queryFn: async () => {
      const res = await api.get(`/tasks`, { params: { project_id: id } });
      return res.data.data;
    },
  });

  const project: Project = projectData;
  const tasks: Task[] = tasksData || [];

  if (!project) {
    return <div className="p-8">Loading...</div>;
  }

  const chartData = [
    { name: 'Budget', value: project.budget },
    { name: 'Spent', value: project.spent || 0 },
    { name: 'Remaining', value: Math.max(0, project.budget - (project.spent || 0)) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/projects">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          <p className="mt-1 text-gray-500">{project.description}</p>
          <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {project.location}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" /> {formatDate(project.start_date)} –{' '}
              {formatDate(project.end_date)}
            </span>
          </div>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            statusColors[project.status] || 'bg-gray-100'
          }`}
        >
          {project.status}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-gray-500">Budget</p>
              <p className="mt-1 text-xl font-bold">{formatCurrency(project.budget)}</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-3">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-gray-500">Spent</p>
              <p className="mt-1 text-xl font-bold">
                {formatCurrency(project.spent || 0)}
              </p>
            </div>
            <div className="rounded-lg bg-amber-50 p-3">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-gray-500">Progress</p>
              <p className="mt-1 text-xl font-bold">{project.progress}%</p>
            </div>
            <div className="rounded-lg bg-green-50 p-3">
              <Building2 className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress bar */}
      <Card>
        <CardHeader>
          <CardTitle>Project Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-4 w-full rounded-full bg-gray-100">
            <div
              className="h-4 rounded-full bg-blue-600 transition-all"
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {project.progress}% complete
          </p>
        </CardContent>
      </Card>

      {/* Budget Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> Tasks ({tasks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <p className="text-gray-500">No tasks for this project yet.</p>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-xs text-gray-500">
                      Due {task.due_date ? formatDate(task.due_date) : 'No date'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        task.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : task.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
