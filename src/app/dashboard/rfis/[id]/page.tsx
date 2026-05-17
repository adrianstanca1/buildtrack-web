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
import { ArrowLeft, Trash2, Save } from 'lucide-react';

// RFI detail + inline edit + delete + answer.
//   GET    /api/rfis/:id
//   PUT    /api/rfis/:id (partial)
//   DELETE /api/rfis/:id

interface Rfi {
  id: string;
  project_id: string | null;
  project_name?: string;
  subject: string;
  question: string;
  response: string | null;
  status: 'submitted' | 'open' | 'answered' | 'approved' | 'rejected' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export default function RfiDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    subject: '',
    question: '',
    response: '',
    status: 'open',
    priority: 'normal',
    dueDate: '',
  });
  const [error, setError] = useState('');

  const q = useQuery<{ data: Rfi }>({
    queryKey: ['rfi', id],
    queryFn: async () => (await api.get(`/rfis/${id}`)).data,
    enabled: !!id,
  });
  const rfi = q.data?.data;

  useEffect(() => {
    if (!rfi) return;
    setForm({
      subject: rfi.subject,
      question: rfi.question,
      response: rfi.response ?? '',
      status: rfi.status,
      priority: rfi.priority,
      dueDate: rfi.due_date ? rfi.due_date.slice(0, 10) : '',
    });
  }, [rfi]);

  const update = useMutation({
    mutationFn: async () => (await api.put(`/rfis/${id}`, {
      subject: form.subject,
      question: form.question,
      response: form.response || null,
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate || null,
    })).data,
    onSuccess: () => { setEditing(false); q.refetch(); },
    onError: (err: any) => setError(err.response?.data?.error?.message || 'Could not save.'),
  });

  const remove = useMutation({
    mutationFn: async () => (await api.delete(`/rfis/${id}`)).data,
    onSuccess: () => router.push('/dashboard/rfis'),
  });

  if (q.isLoading) return <p className="text-gray-500">Loading…</p>;
  if (!rfi) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/rfis" className="inline-flex items-center text-sm text-gray-500">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Link>
        <Card><CardContent className="py-12 text-center text-gray-500">RFI not found.</CardContent></Card>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    submitted: 'bg-blue-100 text-blue-700',
    open: 'bg-amber-100 text-amber-700',
    answered: 'bg-green-100 text-green-700',
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
    closed: 'bg-gray-100 text-gray-700',
  };
  const priorityColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-700',
    normal: 'bg-blue-100 text-blue-700',
    high: 'bg-amber-100 text-amber-700',
    urgent: 'bg-red-100 text-red-700',
  };

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/dashboard/rfis" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to RFIs
      </Link>

      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">{rfi.subject}</h1>
        <div className="flex gap-2">
          {!editing && (
            <Button type="button" variant="primary" onClick={() => setEditing(true)}>Edit / Answer</Button>
          )}
          <Button
            type="button"
            variant="ghost"
            onClick={() => { if (window.confirm('Delete this RFI?')) remove.mutate(); }}
            loading={remove.isPending}
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
              <Input label="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Question</label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  rows={3}
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Response (mark as answered)</label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  rows={3}
                  value={form.response}
                  onChange={(e) => setForm({ ...form, response: e.target.value })}
                  placeholder="Type the answer here. Setting status to 'answered' is a separate field."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="submitted">Submitted</option>
                    <option value="open">Open</option>
                    <option value="answered">Answered</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <Input type="date" label="Due date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              <div className="flex gap-2 pt-2">
                <Button type="submit" variant="primary" loading={update.isPending}><Save className="mr-1 h-4 w-4" /> Save</Button>
                <Button type="button" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[rfi.status] || 'bg-gray-100 text-gray-700'}`}>{rfi.status}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${priorityColors[rfi.priority] || 'bg-gray-100 text-gray-700'}`}>{rfi.priority}</span>
              </div>
              <div>
                <div className="text-xs font-medium uppercase text-gray-400">Question</div>
                <p className="mt-1 whitespace-pre-wrap text-gray-700">{rfi.question}</p>
              </div>
              {rfi.response && (
                <div>
                  <div className="text-xs font-medium uppercase text-gray-400">Response</div>
                  <p className="mt-1 whitespace-pre-wrap text-gray-700">{rfi.response}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><div className="text-xs font-medium uppercase text-gray-400">Project</div><div className="mt-1 text-gray-700">{rfi.project_name || '—'}</div></div>
                <div><div className="text-xs font-medium uppercase text-gray-400">Due</div><div className="mt-1 text-gray-700">{rfi.due_date ? formatDate(rfi.due_date) : '—'}</div></div>
                <div><div className="text-xs font-medium uppercase text-gray-400">Created</div><div className="mt-1 text-gray-700">{formatDate(rfi.created_at)}</div></div>
                <div><div className="text-xs font-medium uppercase text-gray-400">Updated</div><div className="mt-1 text-gray-700">{formatDate(rfi.updated_at)}</div></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
