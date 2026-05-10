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

export default function CreateSubmittalPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    projectId: '',
    submittalNumber: '',
    title: '',
    description: '',
    specSection: '',
    type: 'shop_drawing',
    responsibleCompany: '',
    dueDate: '',
    linkedDrawingId: '',
  });

  const create = useMutation({
    mutationFn: async () => {
      const res = await api.post('/submittals', {
        projectId: form.projectId,
        submittalNumber: form.submittalNumber,
        title: form.title,
        description: form.description || undefined,
        specSection: form.specSection || undefined,
        type: form.type,
        responsibleCompany: form.responsibleCompany || undefined,
        dueDate: form.dueDate || undefined,
        linkedDrawingId: form.linkedDrawingId || undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submittals'] });
      router.push('/dashboard/submittals');
    },
    onError: (err: any) => {
      setError(err.response?.data?.error?.message || 'Failed to create submittal');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.projectId || !form.submittalNumber || !form.title) {
      setError('Project, submittal number, and title are required');
      return;
    }
    create.mutate();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/submittals">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Submittal</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submittal Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Input label="Project ID" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} required />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Submittal Number" value={form.submittalNumber} onChange={(e) => setForm({ ...form, submittalNumber: e.target.value })} required />
              <Input label="Spec Section" value={form.specSection} onChange={(e) => setForm({ ...form, specSection: e.target.value })} />
            </div>
            <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Optional description..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="shop_drawing">Shop Drawing</option>
                  <option value="product_data">Product Data</option>
                  <option value="sample">Sample</option>
                  <option value="mockup">Mockup</option>
                  <option value="closeout">Closeout</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <Input label="Responsible Company" value={form.responsibleCompany} onChange={(e) => setForm({ ...form, responsibleCompany: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Due Date" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              <Input label="Linked Drawing ID" value={form.linkedDrawingId} onChange={(e) => setForm({ ...form, linkedDrawingId: e.target.value })} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Link href="/dashboard/submittals">
                <Button variant="outline" type="button">Cancel</Button>
              </Link>
              <Button type="submit" loading={create.isPending}>Create Submittal</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
