'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatDate } from '@/lib/utils';
import { Search, Plus, CheckCircle2, Circle, Clock } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  due_date: string;
  project_name: string;
}

export default function TasksPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['tasks', search, statusFilter],
    queryFn: async () => {
      const res = await api.get('/tasks', { params: { search, status: statusFilter } });
      return res.data;
    },
  });

  const tasks = data?.data || [];

  const priorityColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-amber-100 text-amber-700',
    urgent: 'bg-red-100 text-red-700',
  };

  const statusIcons: Record<string, React.ReactNode> = {
    pending: <Circle className="h-5 w-5 text-gray-400" />,
    'in-progress': <Clock className="h-5 w-5 text-blue-500" />,
    completed: <CheckCircle2 className="h-5 w-5 text-green-500" />,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <Button><Plus className="mr-2 h-4 w-4" /> New Task</Button>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <select
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : tasks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">No tasks found.</CardContent>
          </Card>
        ) : (
          tasks.map((task: Task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-start gap-4 p-4">
                <div className="mt-0.5">{statusIcons[task.status] || statusIcons.pending}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-gray-900 truncate">{task.title}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 truncate">{task.description}</p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                    <span>{task.project_name || 'No project'}</span>
                    {task.due_date && <span>Due {formatDate(task.due_date)}</span>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
