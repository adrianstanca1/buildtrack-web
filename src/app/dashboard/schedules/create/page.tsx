'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const statusOptions = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function CreateScheduleTaskPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    projectId: '',
    projectName: '',
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    durationDays: '',
    progressPercent: '',
    status: 'not_started',
    isMilestone: false,
    isCriticalPath: false,
    wbsCode: '',
    assignedName: '',
    costEstimate: '',
    actualCost: '',
    notes: '',
  });

  const create = useMutation({
    mutationFn: async () => {
      const res = await api.post('/schedules', {
        projectId: form.projectId || undefined,
        projectName: form.projectName || undefined,
        name: form.name,
        description: form.description || undefined,
        startDate: form.startDate,
        endDate: form.endDate || undefined,
        durationDays: form.durationDays ? parseInt(form.durationDays) : undefined,
        progressPercent: form.progressPercent ? parseFloat(form.progressPercent) : undefined,
        status: form.status,
        isMilestone: form.isMilestone,
        isCriticalPath: form.isCriticalPath,
        wbsCode: form.wbsCode || undefined,
        assignedName: form.assignedName || undefined,
        costEstimate: form.costEstimate ? parseFloat(form.costEstimate) : undefined,
        actualCost: form.actualCost ? parseFloat(form.actualCost) : undefined,
        notes: form.notes || undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      router.push('/dashboard/schedules');
    },
    onError: (err: any) => {
      setError(err.response?.data?.error?.message || 'Failed to create task');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.startDate) {
      setError('Name and start date are required');
      return;
    }
    create.mutate();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/schedules">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Schedule Task</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Task Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="grid grid-cols-2 gap-4">
              <Input label="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <Input label="WBS Code" value={form.wbsCode} onChange={(e) => setForm({ ...form, wbsCode: e.target.value })} placeholder="e.g. 1.2.3" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
              <textarea className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[60px]"
                value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Start Date *</label>
                <input type="date" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">End Date</label>
                <input type="date" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input label="Duration (days)" type="number" min="0" value={form.durationDays} onChange={(e) => setForm({ ...form, durationDays: e.target.value })} />
              <Input label="Progress %" type="number" min="0" max="100" value={form.progressPercent} onChange={(e) => setForm({ ...form, progressPercent: e.target.value })} />
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Assigned To" value={form.assignedName} onChange={(e) => setForm({ ...form, assignedName: e.target.value })} />
              <Input label="Project ID" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} placeholder="Optional" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Cost Estimate (£)" type="number" min="0" step="0.01" value={form.costEstimate} onChange={(e) => setForm({ ...form, costEstimate: e.target.value })} />
              <Input label="Actual Cost (£)" type="number" min="0" step="0.01" value={form.actualCost} onChange={(e) => setForm({ ...form, actualCost: e.target.value })} />
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form.isMilestone} onChange={(e) => setForm({ ...form, isMilestone: e.target.checked })} className="rounded border-gray-300" />
                Milestone
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form.isCriticalPath} onChange={(e) => setForm({ ...form, isCriticalPath: e.target.checked })} className="rounded border-gray-300" />
                Critical Path
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Link href="/dashboard/schedules"><Button type="button" variant="outline">Cancel</Button></Link>
              <Button type="submit" disabled={create.isPending}>{create.isPending ? 'Creating...' : 'Create Task'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
