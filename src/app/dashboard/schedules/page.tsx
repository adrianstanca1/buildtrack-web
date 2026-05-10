'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Plus, Calendar, Milestone, Route, CheckCircle2, Circle, AlertCircle, PauseCircle } from 'lucide-react';

interface ScheduleTask {
  id: string;
  project_name: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  progress_percent: number;
  status: string;
  is_milestone: boolean;
  is_critical_path: boolean;
  wbs_code: string;
  assigned_name: string;
  cost_estimate: number;
  actual_cost: number;
}

const statusColors: Record<string, string> = {
  not_started: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  on_hold: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const statusIcons: Record<string, any> = {
  not_started: Circle,
  in_progress: AlertCircle,
  on_hold: PauseCircle,
  completed: CheckCircle2,
  cancelled: AlertCircle,
};

export default function SchedulesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['schedules', search, statusFilter],
    queryFn: async () => {
      const res = await api.get('/schedules', {
        params: { search, status: statusFilter || undefined },
      });
      return res.data;
    },
  });

  const tasks = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Schedules</h1>
        <Link href="/dashboard/schedules/create">
          <Button><Plus className="mr-2 h-4 w-4" /> New Task</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:w-40"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              {Object.keys(statusColors).map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="py-12 text-center text-gray-500">Loading schedule...</div>
      ) : tasks.length === 0 ? (
        <div className="py-12 text-center text-gray-400">
          <Calendar className="mx-auto mb-3 h-12 w-12 opacity-40" />
          <p className="text-lg font-medium">No schedule tasks yet</p>
          <p className="text-sm">Add your first task to build the project timeline.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task: ScheduleTask) => {
            const StatusIcon = statusIcons[task.status] || Circle;
            return (
              <Card key={task.id} className={`transition hover:shadow-md ${task.is_critical_path ? 'border-red-200' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {task.is_milestone && (
                          <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 flex items-center gap-1">
                            <Milestone className="h-3 w-3" /> Milestone
                          </span>
                        )}
                        {task.is_critical_path && (
                          <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1">
                            <Route className="h-3 w-3" /> Critical Path
                          </span>
                        )}
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[task.status] || statusColors.not_started}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                        {task.wbs_code && <span className="text-xs text-gray-400">{task.wbs_code}</span>}
                      </div>
                      <h3 className="mt-1 text-lg font-semibold text-gray-900 truncate">{task.name}</h3>
                      <p className="text-sm text-gray-500">{task.project_name || 'Unassigned'}</p>
                      
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                        <span>{new Date(task.start_date).toLocaleDateString()}</span>
                        {task.end_date && <span>→ {new Date(task.end_date).toLocaleDateString()}</span>}
                        {task.duration_days > 0 && <span>{task.duration_days} days</span>}
                        {task.assigned_name && <span>Assigned: {task.assigned_name}</span>}
                      </div>
                      
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-gray-200">
                            <div className="h-2 rounded-full bg-blue-600 transition-all" style={{ width: `${task.progress_percent}%` }} />
                          </div>
                          <span className="text-xs text-gray-500">{task.progress_percent}%</span>
                        </div>
                      </div>
                      
                      {(task.cost_estimate > 0 || task.actual_cost > 0) && (
                        <p className="mt-1 text-xs text-gray-400">
                          Est: £{task.cost_estimate?.toLocaleString()} • Actual: £{task.actual_cost?.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
