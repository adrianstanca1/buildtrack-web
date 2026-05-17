'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Trash2, CheckCircle2, Save } from 'lucide-react';

// Task detail + inline edit + delete + mark-complete.
//
// Backend surface used here:
//   GET    /api/tasks/:id          — load
//   PUT    /api/tasks/:id          — partial update (taskSchema.partial())
//   DELETE /api/tasks/:id          — delete
//   POST   /api/tasks/:id/complete — convenience to flip status

interface Task {
  id: string;
  project_id: string | null;
  project_name?: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed';
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('pending');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');

  const taskQuery = useQuery<{ success: boolean; data: Task }>({
    queryKey: ['task', id],
    queryFn: async () => (await api.get(`/tasks/${id}`)).data,
    enabled: !!id,
  });

  const task = taskQuery.data?.data;

  // Hydrate form state from server data on first load and after refetch.
  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setDescription(task.description ?? '');
    setPriority(task.priority);
    setStatus(task.status);
    setDueDate(task.due_date ? task.due_date.slice(0, 10) : '');
  }, [task]);

  const update = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {
        title,
        description: description || null,
        priority,
        status,
      };
      payload.dueDate = dueDate || null;
      return (await api.put(`/tasks/${id}`, payload)).data;
    },
    onSuccess: () => {
      setEditing(false);
      taskQuery.refetch();
    },
    onError: (err: any) => {
      setError(err.response?.data?.error?.message || 'Could not update task.');
    },
  });

  const complete = useMutation({
    mutationFn: async () => (await api.post(`/tasks/${id}/complete`)).data,
    onSuccess: () => taskQuery.refetch(),
  });

  const remove = useMutation({
    mutationFn: async () => (await api.delete(`/tasks/${id}`)).data,
    onSuccess: () => router.push('/dashboard/tasks'),
    onError: (err: any) => {
      setError(err.response?.data?.error?.message || 'Could not delete task.');
    },
  });

  if (taskQuery.isLoading) {
    return <p className="text-gray-500">Loading…</p>;
  }
  if (taskQuery.isError || !task) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/tasks" className="inline-flex items-center text-sm text-gray-500">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Link>
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            Task not found, or you don&apos;t have access.
          </CardContent>
        </Card>
      </div>
    );
  }

  const priorityColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-amber-100 text-amber-700',
    urgent: 'bg-red-100 text-red-700',
  };
  const statusColors: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
  };

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        href="/dashboard/tasks"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to tasks
      </Link>

      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
        <div className="flex gap-2">
          {task.status !== 'completed' && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => complete.mutate()}
              loading={complete.isPending}
              title="Mark as completed"
            >
              <CheckCircle2 className="mr-1 h-4 w-4" /> Mark complete
            </Button>
          )}
          {!editing && (
            <Button type="button" variant="primary" onClick={() => setEditing(true)}>
              Edit
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              if (window.confirm('Delete this task? This cannot be undone.')) {
                remove.mutate();
              }
            }}
            loading={remove.isPending}
            title="Delete task"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <Card>
        <CardContent className="space-y-4 p-6">
          {editing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                update.mutate();
              }}
              className="space-y-4"
            >
              <Input
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <select
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <Input
                type="date"
                label="Due date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              <div className="flex gap-2 pt-2">
                <Button type="submit" variant="primary" loading={update.isPending}>
                  <Save className="mr-1 h-4 w-4" /> Save changes
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setEditing(false);
                    setError('');
                    // Reset form back to server state.
                    if (task) {
                      setTitle(task.title);
                      setDescription(task.description ?? '');
                      setPriority(task.priority);
                      setStatus(task.status);
                      setDueDate(task.due_date ? task.due_date.slice(0, 10) : '');
                    }
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${priorityColors[task.priority]}`}>
                  {task.priority}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[task.status]}`}>
                  {task.status}
                </span>
              </div>
              {task.description && (
                <div>
                  <div className="text-xs font-medium uppercase text-gray-400">Description</div>
                  <p className="mt-1 whitespace-pre-wrap text-gray-700">{task.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs font-medium uppercase text-gray-400">Project</div>
                  <div className="mt-1 text-gray-700">{task.project_name || '—'}</div>
                </div>
                <div>
                  <div className="text-xs font-medium uppercase text-gray-400">Due date</div>
                  <div className="mt-1 text-gray-700">
                    {task.due_date ? formatDate(task.due_date) : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium uppercase text-gray-400">Created</div>
                  <div className="mt-1 text-gray-700">{formatDate(task.created_at)}</div>
                </div>
                <div>
                  <div className="text-xs font-medium uppercase text-gray-400">Updated</div>
                  <div className="mt-1 text-gray-700">{formatDate(task.updated_at)}</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
