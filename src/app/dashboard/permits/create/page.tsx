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

export default function CreatePermitPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    type: 'general',
    location: '',
    issuedBy: '',
    issuedTo: '',
    validFrom: '',
    validTo: '',
    conditions: '',
    riskLevel: 'medium',
    projectId: '',
  });

  const create = useMutation({
    mutationFn: async () => {
      const res = await api.post('/permits', {
        ...form,
        projectId: Number(form.projectId),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permits'] });
      router.push('/dashboard/permits');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to create permit');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.title || !form.projectId) {
      setError('Title and project are required');
      return;
    }
    create.mutate();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/permits">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Permit</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Permit Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="hot_work">Hot Work</option>
                  <option value="confined_space">Confined Space</option>
                  <option value="excavation">Excavation</option>
                  <option value="working_at_height">Working at Height</option>
                  <option value="electrical">Electrical</option>
                  <option value="general">General</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  value={form.riskLevel}
                  onChange={(e) => setForm({ ...form, riskLevel: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Issued By" value={form.issuedBy} onChange={(e) => setForm({ ...form, issuedBy: e.target.value })} />
              <Input label="Issued To" value={form.issuedTo} onChange={(e) => setForm({ ...form, issuedTo: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Valid From" type="date" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} />
              <Input label="Valid To" type="date" value={form.validTo} onChange={(e) => setForm({ ...form, validTo: e.target.value })} />
            </div>
            <Input label="Project ID" type="number" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} required />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Conditions</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                rows={3}
                value={form.conditions}
                onChange={(e) => setForm({ ...form, conditions: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Link href="/dashboard/permits">
                <Button variant="outline" type="button">Cancel</Button>
              </Link>
              <Button type="submit" loading={create.isPending}>Create Permit</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
