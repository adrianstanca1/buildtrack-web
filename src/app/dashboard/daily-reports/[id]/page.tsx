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

// Daily report detail + edit + delete.
//   GET    /api/daily-reports/:id
//   PUT    /api/daily-reports/:id (partial)
//   DELETE /api/daily-reports/:id

interface DailyReport {
  id: string;
  project_id: string | null;
  project_name?: string;
  report_date: string;
  weather: string | null;
  temperature: number | null;
  workers_on_site: number | null;
  work_completed: string | null;
  materials_used: string | null;
  equipment_used: string | null;
  issues_delays: string | null;
  safety_observations: string | null;
  next_day_plan: string | null;
  submitted_by: string;
  status: 'draft' | 'submitted' | 'approved';
  created_at: string;
  updated_at: string;
}

export default function DailyReportDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    weather: '',
    workersOnSite: '',
    workCompleted: '',
    materialsUsed: '',
    equipmentUsed: '',
    issuesDelays: '',
    safetyObservations: '',
    nextDayPlan: '',
    status: 'draft',
  });
  const [error, setError] = useState('');

  const q = useQuery<{ data: DailyReport }>({
    queryKey: ['daily-report', id],
    queryFn: async () => (await api.get(`/daily-reports/${id}`)).data,
    enabled: !!id,
  });
  const r = q.data?.data;

  useEffect(() => {
    if (!r) return;
    setForm({
      weather: r.weather ?? '',
      workersOnSite: r.workers_on_site ? String(r.workers_on_site) : '',
      workCompleted: r.work_completed ?? '',
      materialsUsed: r.materials_used ?? '',
      equipmentUsed: r.equipment_used ?? '',
      issuesDelays: r.issues_delays ?? '',
      safetyObservations: r.safety_observations ?? '',
      nextDayPlan: r.next_day_plan ?? '',
      status: r.status,
    });
  }, [r]);

  const update = useMutation({
    mutationFn: async () => (await api.put(`/daily-reports/${id}`, {
      weather: form.weather || null,
      workersOnSite: form.workersOnSite ? Number(form.workersOnSite) : null,
      workCompleted: form.workCompleted || null,
      materialsUsed: form.materialsUsed || null,
      equipmentUsed: form.equipmentUsed || null,
      issuesDelays: form.issuesDelays || null,
      safetyObservations: form.safetyObservations || null,
      nextDayPlan: form.nextDayPlan || null,
      status: form.status,
    })).data,
    onSuccess: () => { setEditing(false); q.refetch(); },
    onError: (err: any) => setError(err.response?.data?.error?.message || 'Could not save.'),
  });

  const remove = useMutation({
    mutationFn: async () => (await api.delete(`/daily-reports/${id}`)).data,
    onSuccess: () => router.push('/dashboard/daily-reports'),
  });

  if (q.isLoading) return <p className="text-gray-500">Loading…</p>;
  if (!r) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/daily-reports" className="inline-flex items-center text-sm text-gray-500">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Link>
        <Card><CardContent className="py-12 text-center text-gray-500">Report not found.</CardContent></Card>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    submitted: 'bg-blue-100 text-blue-700',
    approved: 'bg-green-100 text-green-700',
  };

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/dashboard/daily-reports" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to daily reports
      </Link>

      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Daily report — {formatDate(r.report_date)}</h1>
        <div className="flex gap-2">
          {!editing && (
            <Button type="button" variant="primary" onClick={() => setEditing(true)}>Edit</Button>
          )}
          <Button
            type="button"
            variant="ghost"
            onClick={() => { if (window.confirm('Delete this daily report?')) remove.mutate(); }}
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
              <div className="grid grid-cols-2 gap-4">
                <Input label="Weather" value={form.weather} onChange={(e) => setForm({ ...form, weather: e.target.value })} />
                <Input type="number" label="Workers on site" value={form.workersOnSite} onChange={(e) => setForm({ ...form, workersOnSite: e.target.value })} />
              </div>
              {([
                ['Work completed', 'workCompleted'],
                ['Materials used', 'materialsUsed'],
                ['Equipment used', 'equipmentUsed'],
                ['Issues / delays', 'issuesDelays'],
                ['Safety observations', 'safetyObservations'],
                ['Next-day plan', 'nextDayPlan'],
              ] as const).map(([label, key]) => (
                <div key={key} className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">{label}</label>
                  <textarea
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    rows={2}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  />
                </div>
              ))}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="approved">Approved</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" variant="primary" loading={update.isPending}><Save className="mr-1 h-4 w-4" /> Save</Button>
                <Button type="button" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[r.status] || 'bg-gray-100 text-gray-700'}`}>{r.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><div className="text-xs font-medium uppercase text-gray-400">Project</div><div className="mt-1 text-gray-700">{r.project_name || '—'}</div></div>
                <div><div className="text-xs font-medium uppercase text-gray-400">Submitted by</div><div className="mt-1 text-gray-700">{r.submitted_by}</div></div>
                <div><div className="text-xs font-medium uppercase text-gray-400">Weather</div><div className="mt-1 text-gray-700">{r.weather || '—'}</div></div>
                <div><div className="text-xs font-medium uppercase text-gray-400">Workers</div><div className="mt-1 text-gray-700">{r.workers_on_site ?? '—'}</div></div>
              </div>
              {([
                ['Work completed', r.work_completed],
                ['Materials used', r.materials_used],
                ['Equipment used', r.equipment_used],
                ['Issues / delays', r.issues_delays],
                ['Safety observations', r.safety_observations],
                ['Next-day plan', r.next_day_plan],
              ] as const)
                .filter(([, v]) => !!v)
                .map(([label, v]) => (
                  <div key={label}>
                    <div className="text-xs font-medium uppercase text-gray-400">{label}</div>
                    <p className="mt-1 whitespace-pre-wrap text-gray-700">{v}</p>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
