'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock } from 'lucide-react';
import Link from 'next/link';

const categoryOptions = [
  { value: 'regular', label: 'Regular' },
  { value: 'overtime', label: 'Overtime' },
  { value: 'weekend', label: 'Weekend' },
  { value: 'holiday', label: 'Holiday' },
  { value: 'sick', label: 'Sick' },
  { value: 'leave', label: 'Leave' },
];

const statusOptions = [
  { value: 'submitted', label: 'Submitted' },
  { value: 'approved', label: 'Approved' },
];

export default function CreateTimesheetPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    projectId: '',
    workerId: '',
    entryDate: '',
    hoursWorked: '',
    overtimeHours: '',
    hourlyRate: '',
    overtimeRate: '',
    workDescription: '',
    category: 'regular',
    status: 'submitted',
    notes: '',
  });

  const create = useMutation({
    mutationFn: async () => {
      const res = await api.post('/timesheets', {
        projectId: form.projectId,
        workerId: form.workerId,
        entryDate: form.entryDate,
        hoursWorked: parseFloat(form.hoursWorked),
        overtimeHours: form.overtimeHours ? parseFloat(form.overtimeHours) : undefined,
        hourlyRate: form.hourlyRate ? parseFloat(form.hourlyRate) : undefined,
        overtimeRate: form.overtimeRate ? parseFloat(form.overtimeRate) : undefined,
        workDescription: form.workDescription || undefined,
        category: form.category,
        status: form.status,
        notes: form.notes || undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
      router.push('/dashboard/timesheets');
    },
    onError: (err: any) => {
      setError(err.response?.data?.error?.message || 'Failed to log hours');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.projectId || !form.workerId || !form.entryDate || !form.hoursWorked) {
      setError('Project, worker, date, and hours worked are required');
      return;
    }
    create.mutate();
  };

  const totalHours = (parseFloat(form.hoursWorked) || 0) + (parseFloat(form.overtimeHours) || 0);
  const regularPay = (parseFloat(form.hoursWorked) || 0) * (parseFloat(form.hourlyRate) || 0);
  const otPay = (parseFloat(form.overtimeHours) || 0) * (parseFloat(form.overtimeRate) || parseFloat(form.hourlyRate) * 1.5 || 0);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/timesheets">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Log Hours</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Timesheet Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="grid grid-cols-2 gap-4">
              <Input label="Project ID" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} required />
              <Input label="Worker ID" value={form.workerId} onChange={(e) => setForm({ ...form, workerId: e.target.value })} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Date" type="date" value={form.entryDate} onChange={(e) => setForm({ ...form, entryDate: e.target.value })} required />
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
                <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} >
                  {categoryOptions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Hours Worked" type="number" min="0" max="24" step="0.5" value={form.hoursWorked} onChange={(e) => setForm({ ...form, hoursWorked: e.target.value })} required />
              <Input label="Overtime Hours" type="number" min="0" max="24" step="0.5" value={form.overtimeHours} onChange={(e) => setForm({ ...form, overtimeHours: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Hourly Rate (£)" type="number" min="0" step="0.01" value={form.hourlyRate} onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })} />
              <Input label="Overtime Rate (£)" type="number" min="0" step="0.01" value={form.overtimeRate} onChange={(e) => setForm({ ...form, overtimeRate: e.target.value })} />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Work Description</label>
              <textarea className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[60px]"
                value={form.workDescription} onChange={(e) => setForm({ ...form, workDescription: e.target.value })} placeholder="What work was performed?" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
              <textarea className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[60px]"
                value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>

            <div className="rounded-lg bg-gray-50 p-4 space-y-1 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Total Hours</span>
                <span>{totalHours.toFixed(1)} hrs</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Regular Pay</span>
                <span>£{regularPay.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Overtime Pay</span>
                <span>£{otPay.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-900 text-base border-t pt-1">
                <span>Total Pay</span>
                <span>£{(regularPay + otPay).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Link href="/dashboard/timesheets"><Button type="button" variant="outline">Cancel</Button></Link>
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? 'Saving...' : 'Log Hours'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
