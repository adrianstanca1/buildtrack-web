'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft } from 'lucide-react';

// POST /api/tasks expects: { projectId, title, description, assignedTo?,
// priority, status, dueDate? }. We don't expose `assignedTo` here — it's
// a UUID that belongs in a worker-picker, kept for a follow-up. Project
// selection is required because every task is project-scoped.

interface Project {
  id: string;
  name: string;
}

export default function CreateTaskPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('pending');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');

  const { data: projectsData } = useQuery({
    queryKey: ['projects-for-task-create'],
    queryFn: async () => (await api.get('/projects', { params: { limit: 200 } })).data,
  });
  const projects: Project[] = projectsData?.data || [];

  const createTask = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {
        title,
        description: description || undefined,
        priority,
        status,
      };
      if (projectId) payload.projectId = projectId;
      if (dueDate) payload.dueDate = dueDate;
      const res = await api.post('/tasks', payload);
      return res.data;
    },
    onSuccess: (res) => {
      const id = res?.data?.id;
      router.push(id ? `/dashboard/tasks/${id}` : '/dashboard/tasks');
    },
    onError: (err: any) => {
      setError(err.response?.data?.error?.message || 'Could not create task.');
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    createTask.mutate();
  };

  return (
    <div className="max-w-2xl space-y-6">
      <Link
        href="/dashboard/tasks"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to tasks
      </Link>

      <h1 className="text-2xl font-bold text-gray-900">New task</h1>

      <Card>
        <CardContent className="space-y-4 p-6">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}
          <form onSubmit={submit} className="space-y-4">
            <Input
              label="Title"
              placeholder="e.g. Pour foundation for Block A"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional context for the assignee"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Project</label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
              >
                <option value="">No project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
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
              <Button type="submit" variant="primary" loading={createTask.isPending}>
                Create task
              </Button>
              <Link href="/dashboard/tasks">
                <Button type="button" variant="ghost">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
