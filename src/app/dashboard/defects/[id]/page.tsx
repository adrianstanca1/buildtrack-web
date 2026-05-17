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
import { ArrowLeft, Trash2, Save, Radio } from 'lucide-react';
import { subscribeProject, type EventPayload } from '@/lib/realtime';

// Defect detail + inline edit + delete.
//   GET    /api/defects/:id
//   PUT    /api/defects/:id
//   DELETE /api/defects/:id

interface Defect {
  id: string;
  project_id: string | null;
  project_name?: string;
  title: string;
  description: string | null;
  location: string | null;
  trade: string | null;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'fixed' | 'verified' | 'closed';
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export default function DefectDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    trade: '',
    priority: 'medium',
    status: 'open',
    dueDate: '',
  });
  const [error, setError] = useState('');

  const q = useQuery<{ data: Defect }>({
    queryKey: ['defect', id],
    queryFn: async () => (await api.get(`/defects/${id}`)).data,
    enabled: !!id,
  });
  const defect = q.data?.data;
  const [liveEvent, setLiveEvent] = useState<EventPayload | null>(null);

  // Real-time subscription on this defect's project room — refetch on
  // same-defect events, bail to list on delete.
  useEffect(() => {
    const projectId = defect?.project_id;
    if (!projectId) return;
    return subscribeProject(projectId, (ev) => {
      const incoming = (ev as any).defect;
      if (incoming?.id !== id) return;
      if (ev.type === 'defect-deleted') {
        router.push('/dashboard/defects');
        return;
      }
      setLiveEvent(ev);
      q.refetch();
    }, ['defect']);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defect?.project_id, id, router]);

  useEffect(() => {
    if (!defect) return;
    setForm({
      title: defect.title,
      description: defect.description ?? '',
      location: defect.location ?? '',
      trade: defect.trade ?? '',
      priority: defect.priority,
      status: defect.status,
      dueDate: defect.due_date ? defect.due_date.slice(0, 10) : '',
    });
  }, [defect]);

  const update = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {
        title: form.title,
        description: form.description || null,
        location: form.location || null,
        trade: form.trade || null,
        priority: form.priority,
        status: form.status,
        dueDate: form.dueDate || null,
      };
      return (await api.put(`/defects/${id}`, payload)).data;
    },
    onSuccess: () => { setEditing(false); q.refetch(); },
    onError: (err: any) => setError(err.response?.data?.error?.message || 'Could not save.'),
  });

  const remove = useMutation({
    mutationFn: async () => (await api.delete(`/defects/${id}`)).data,
    onSuccess: () => router.push('/dashboard/defects'),
  });

  if (q.isLoading) return <p className="text-gray-500">Loading…</p>;
  if (!defect) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/defects" className="inline-flex items-center text-sm text-gray-500">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Link>
        <Card><CardContent className="py-12 text-center text-gray-500">Defect not found.</CardContent></Card>
      </div>
    );
  }

  const priorityColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-amber-100 text-amber-700',
    critical: 'bg-red-100 text-red-700',
  };
  const statusColors: Record<string, string> = {
    open: 'bg-red-100 text-red-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    fixed: 'bg-purple-100 text-purple-700',
    verified: 'bg-emerald-100 text-emerald-700',
    closed: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/dashboard/defects" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to defects
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-900">{defect.title}</h1>
          {liveEvent && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
              <Radio className="h-3 w-3 animate-pulse" />
              Live update: {liveEvent.type.replace('defect-', '')} ·{' '}
              {new Date(liveEvent.at).toLocaleTimeString('en-GB')}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {!editing && (
            <Button type="button" variant="primary" onClick={() => setEditing(true)}>
              Edit
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              if (window.confirm('Delete this defect? This cannot be undone.')) remove.mutate();
            }}
            loading={remove.isPending}
            title="Delete defect"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <Card>
        <CardContent className="space-y-4 p-6">
          {editing ? (
            <form onSubmit={(e) => { e.preventDefault(); update.mutate(); }} className="space-y-4">
              <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                <Input label="Trade" value={form.trade} onChange={(e) => setForm({ ...form, trade: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="open">Open</option>
                    <option value="in-progress">In progress</option>
                    <option value="fixed">Fixed</option>
                    <option value="verified">Verified</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
              <Input type="date" label="Due date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              <div className="flex gap-2 pt-2">
                <Button type="submit" variant="primary" loading={update.isPending}>
                  <Save className="mr-1 h-4 w-4" /> Save changes
                </Button>
                <Button type="button" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${priorityColors[defect.priority] || 'bg-gray-100 text-gray-700'}`}>{defect.priority}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[defect.status] || 'bg-gray-100 text-gray-700'}`}>{defect.status}</span>
              </div>
              {defect.description && (
                <div>
                  <div className="text-xs font-medium uppercase text-gray-400">Description</div>
                  <p className="mt-1 whitespace-pre-wrap text-gray-700">{defect.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><div className="text-xs font-medium uppercase text-gray-400">Project</div><div className="mt-1 text-gray-700">{defect.project_name || '—'}</div></div>
                <div><div className="text-xs font-medium uppercase text-gray-400">Location</div><div className="mt-1 text-gray-700">{defect.location || '—'}</div></div>
                <div><div className="text-xs font-medium uppercase text-gray-400">Trade</div><div className="mt-1 text-gray-700">{defect.trade || '—'}</div></div>
                <div><div className="text-xs font-medium uppercase text-gray-400">Due date</div><div className="mt-1 text-gray-700">{defect.due_date ? formatDate(defect.due_date) : '—'}</div></div>
                <div><div className="text-xs font-medium uppercase text-gray-400">Created</div><div className="mt-1 text-gray-700">{formatDate(defect.created_at)}</div></div>
                <div><div className="text-xs font-medium uppercase text-gray-400">Updated</div><div className="mt-1 text-gray-700">{formatDate(defect.updated_at)}</div></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
