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

export default function CreateDailyReportPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    projectId: '',
    reportDate: new Date().toISOString().split('T')[0],
    weather: '',
    temperature: '',
    workersOnSite: '',
    workCompleted: '',
    materialsUsed: '',
    equipmentUsed: '',
    issuesDelays: '',
    safetyObservations: '',
    nextDayPlan: '',
    submittedBy: '',
    status: 'draft',
  });

  const create = useMutation({
    mutationFn: async () => {
      const res = await api.post('/daily-reports', {
        projectId: form.projectId,
        reportDate: new Date(form.reportDate).toISOString(),
        weather: form.weather || undefined,
        temperature: form.temperature ? Number(form.temperature) : undefined,
        workersOnSite: form.workersOnSite ? Number(form.workersOnSite) : 0,
        workCompleted: form.workCompleted || undefined,
        materialsUsed: form.materialsUsed || undefined,
        equipmentUsed: form.equipmentUsed || undefined,
        issuesDelays: form.issuesDelays || undefined,
        safetyObservations: form.safetyObservations || undefined,
        nextDayPlan: form.nextDayPlan || undefined,
        submittedBy: form.submittedBy,
        status: form.status,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-reports'] });
      router.push('/dashboard/daily-reports');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to create daily report');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.projectId || !form.reportDate || !form.submittedBy) {
      setError('Project, report date, and submitted by are required');
      return;
    }
    create.mutate();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/daily-reports">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Daily Report</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Report Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Project ID"
                value={form.projectId}
                onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Date</label>
                <input
                  type="date"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  value={form.reportDate}
                  onChange={(e) => setForm({ ...form, reportDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Weather"
                value={form.weather}
                onChange={(e) => setForm({ ...form, weather: e.target.value })}
                placeholder="e.g. Sunny, Cloudy"
              />
              <Input
                label="Temperature (°C)"
                type="number"
                value={form.temperature}
                onChange={(e) => setForm({ ...form, temperature: e.target.value })}
              />
            </div>

            <Input
              label="Workers on Site"
              type="number"
              value={form.workersOnSite}
              onChange={(e) => setForm({ ...form, workersOnSite: e.target.value })}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Completed</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                rows={3}
                value={form.workCompleted}
                onChange={(e) => setForm({ ...form, workCompleted: e.target.value })}
                placeholder="Describe work completed today..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Materials Used</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                rows={2}
                value={form.materialsUsed}
                onChange={(e) => setForm({ ...form, materialsUsed: e.target.value })}
                placeholder="List materials used..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Used</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                rows={2}
                value={form.equipmentUsed}
                onChange={(e) => setForm({ ...form, equipmentUsed: e.target.value })}
                placeholder="List equipment used..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issues / Delays</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                rows={2}
                value={form.issuesDelays}
                onChange={(e) => setForm({ ...form, issuesDelays: e.target.value })}
                placeholder="Any issues or delays encountered..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Safety Observations</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                rows={2}
                value={form.safetyObservations}
                onChange={(e) => setForm({ ...form, safetyObservations: e.target.value })}
                placeholder="Any safety observations or concerns..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Next Day Plan</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                rows={2}
                value={form.nextDayPlan}
                onChange={(e) => setForm({ ...form, nextDayPlan: e.target.value })}
                placeholder="Plan for the next day..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Submitted By"
                value={form.submittedBy}
                onChange={(e) => setForm({ ...form, submittedBy: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="approved">Approved</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Link href="/dashboard/daily-reports">
                <Button variant="outline" type="button">Cancel</Button>
              </Link>
              <Button type="submit" loading={create.isPending}>Create Report</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
