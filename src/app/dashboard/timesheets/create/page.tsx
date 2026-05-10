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

export default function CreateTimesheetPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    workerName: '',
    projectId: '',
    projectName: '',
    weekStarting: '',
    mondayHours: '0',
    tuesdayHours: '0',
    wednesdayHours: '0',
    thursdayHours: '0',
    fridayHours: '0',
    saturdayHours: '0',
    sundayHours: '0',
    notes: '',
  });

  const create = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        projectId: form.projectId ? Number(form.projectId) : undefined,
        mondayHours: Number(form.mondayHours) || 0,
        tuesdayHours: Number(form.tuesdayHours) || 0,
        wednesdayHours: Number(form.wednesdayHours) || 0,
        thursdayHours: Number(form.thursdayHours) || 0,
        fridayHours: Number(form.fridayHours) || 0,
        saturdayHours: Number(form.saturdayHours) || 0,
        sundayHours: Number(form.sundayHours) || 0,
      };
      const res = await api.post('/timesheets', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
      router.push('/dashboard/timesheets');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to create timesheet');
    },
  });

  const totalHours =
    (Number(form.mondayHours) || 0) +
    (Number(form.tuesdayHours) || 0) +
    (Number(form.wednesdayHours) || 0) +
    (Number(form.thursdayHours) || 0) +
    (Number(form.fridayHours) || 0) +
    (Number(form.saturdayHours) || 0) +
    (Number(form.sundayHours) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.workerName || !form.weekStarting) {
      setError('Worker name and week starting date are required');
      return;
    }
    create.mutate();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/timesheets">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Timesheet</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Timesheet Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="grid grid-cols-2 gap-4">
              <Input label="Worker Name" value={form.workerName} onChange={(e) => setForm({ ...form, workerName: e.target.value })} required />
              <Input label="Week Starting" type="date" value={form.weekStarting} onChange={(e) => setForm({ ...form, weekStarting: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Project ID" type="number" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} />
              <Input label="Project Name" value={form.projectName} onChange={(e) => setForm({ ...form, projectName: e.target.value })} />
            </div>
            <div className="grid grid-cols-4 gap-3">
              <Input label="Mon" type="number" min="0" step="0.5" value={form.mondayHours} onChange={(e) => setForm({ ...form, mondayHours: e.target.value })} />
              <Input label="Tue" type="number" min="0" step="0.5" value={form.tuesdayHours} onChange={(e) => setForm({ ...form, tuesdayHours: e.target.value })} />
              <Input label="Wed" type="number" min="0" step="0.5" value={form.wednesdayHours} onChange={(e) => setForm({ ...form, wednesdayHours: e.target.value })} />
              <Input label="Thu" type="number" min="0" step="0.5" value={form.thursdayHours} onChange={(e) => setForm({ ...form, thursdayHours: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Input label="Fri" type="number" min="0" step="0.5" value={form.fridayHours} onChange={(e) => setForm({ ...form, fridayHours: e.target.value })} />
              <Input label="Sat" type="number" min="0" step="0.5" value={form.saturdayHours} onChange={(e) => setForm({ ...form, saturdayHours: e.target.value })} />
              <Input label="Sun" type="number" min="0" step="0.5" value={form.sundayHours} onChange={(e) => setForm({ ...form, sundayHours: e.target.value })} />
            </div>
            <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700">
              Total Hours: <span className="font-semibold">{totalHours.toFixed(1)}</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Link href="/dashboard/timesheets">
                <Button variant="outline" type="button">Cancel</Button>
              </Link>
              <Button type="submit" loading={create.isPending}>Create Timesheet</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
