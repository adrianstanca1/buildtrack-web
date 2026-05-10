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

export default function CreatePunchItemPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    severity: 'minor',
    projectId: '',
    assignedTo: '',
    createdBy: '',
  });

  const create = useMutation({
    mutationFn: async () => {
      const res = await api.post('/punch-items', {
        ...form,
        projectId: Number(form.projectId),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['punch-items'] });
      router.push('/dashboard/punch-items');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to create punch item');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.title || !form.projectId || !form.createdBy) {
      setError('Title, project, and created by are required');
      return;
    }
    create.mutate();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/punch-items">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Punch Item</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Punch Item Details</CardTitle>
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
              <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  value={form.severity}
                  onChange={(e) => setForm({ ...form, severity: e.target.value })}
                >
                  <option value="minor">Minor</option>
                  <option value="major">Major</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Project ID" type="number" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} required />
              <Input label="Created By" value={form.createdBy} onChange={(e) => setForm({ ...form, createdBy: e.target.value })} required />
            </div>
            <Input label="Assigned To" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} />
            <div className="flex justify-end gap-3 pt-2">
              <Link href="/dashboard/punch-items">
                <Button variant="outline" type="button">Cancel</Button>
              </Link>
              <Button type="submit" loading={create.isPending}>Create Punch Item</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
