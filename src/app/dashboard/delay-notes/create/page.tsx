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

export default function CreateDelayNotePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    reason: 'other',
    impactDays: '',
    projectId: '',
    linkedRfiId: '',
    reportedBy: '',
  });

  const create = useMutation({
    mutationFn: async () => {
      const res = await api.post('/delay-notes', {
        ...form,
        projectId: Number(form.projectId),
        impactDays: form.impactDays ? Number(form.impactDays) : 0,
        linkedRfiId: form.linkedRfiId || undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delay-notes'] });
      router.push('/dashboard/delay-notes');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to create delay note');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.title || !form.projectId || !form.reportedBy) {
      setError('Title, project, and reported by are required');
      return;
    }
    create.mutate();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/delay-notes">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Delay Note</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Delay Note Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                >
                  <option value="weather">Weather</option>
                  <option value="material_shortage">Material Shortage</option>
                  <option value="design_change">Design Change</option>
                  <option value="labour_shortage">Labour Shortage</option>
                  <option value="equipment_failure">Equipment Failure</option>
                  <option value="permit_delay">Permit Delay</option>
                  <option value="subcontractor">Subcontractor</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <Input label="Impact (days)" type="number" min="0" value={form.impactDays} onChange={(e) => setForm({ ...form, impactDays: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Project ID" type="number" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} required />
              <Input label="Linked RFI ID" value={form.linkedRfiId} onChange={(e) => setForm({ ...form, linkedRfiId: e.target.value })} placeholder="Optional" />
            </div>
            <Input label="Reported By" value={form.reportedBy} onChange={(e) => setForm({ ...form, reportedBy: e.target.value })} required />
            <div className="flex justify-end gap-3 pt-2">
              <Link href="/dashboard/delay-notes">
                <Button variant="outline" type="button">Cancel</Button>
              </Link>
              <Button type="submit" loading={create.isPending}>Create Delay Note</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
