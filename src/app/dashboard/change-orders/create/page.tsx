'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import { ArrowLeft, PoundSterling, Calendar } from 'lucide-react';
import Link from 'next/link';

const typeOptions = [
  { value: 'scope', label: 'Scope Change' },
  { value: 'price', label: 'Price Adjustment' },
  { value: 'time', label: 'Schedule Change' },
  { value: 'design', label: 'Design Change' },
  { value: 'other', label: 'Other' },
];

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
];

export default function CreateChangeOrderPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    projectId: '',
    projectName: '',
    coNumber: '',
    title: '',
    description: '',
    reason: '',
    type: 'scope',
    status: 'draft',
    requestedBy: '',
    requestedById: '',
    requestedDate: '',
    originalCost: '',
    proposedCost: '',
    originalScheduleDays: '',
    proposedScheduleDays: '',
    reviewedBy: '',
    approvedBy: '',
    notes: '',
  });

  const create = useMutation({
    mutationFn: async () => {
      const res = await api.post('/change-orders', {
        projectId: form.projectId || undefined,
        projectName: form.projectName || undefined,
        coNumber: form.coNumber,
        title: form.title,
        description: form.description || undefined,
        reason: form.reason || undefined,
        type: form.type,
        status: form.status,
        requestedBy: form.requestedBy || undefined,
        requestedById: form.requestedById || undefined,
        requestedDate: form.requestedDate || undefined,
        originalCost: form.originalCost ? parseFloat(form.originalCost) : undefined,
        proposedCost: form.proposedCost ? parseFloat(form.proposedCost) : undefined,
        originalScheduleDays: form.originalScheduleDays ? parseInt(form.originalScheduleDays) : undefined,
        proposedScheduleDays: form.proposedScheduleDays ? parseInt(form.proposedScheduleDays) : undefined,
        reviewedBy: form.reviewedBy || undefined,
        approvedBy: form.approvedBy || undefined,
        notes: form.notes || undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['change-orders'] });
      router.push('/dashboard/change-orders');
    },
    onError: (err: any) => {
      setError(err.response?.data?.error?.message || 'Failed to create change order');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.coNumber.trim() || !form.title.trim()) {
      setError('CO Number and title are required');
      return;
    }
    create.mutate();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/change-orders">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Change Order</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Change Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="grid grid-cols-2 gap-4">
              <Input label="CO Number *" value={form.coNumber} onChange={(e) => setForm({ ...form, coNumber: e.target.value })} required placeholder="e.g. CO-001" />
              <Input label="Project ID" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} placeholder="Optional" />
            </div>

            <Input label="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
              <textarea className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[60px]"
                value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
                <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {typeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            <Input label="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="e.g. Client request, unforeseen condition" />

            <div className="grid grid-cols-2 gap-4">
              <Input label="Original Cost (£)" type="number" min="0" step="0.01" value={form.originalCost} onChange={(e) => setForm({ ...form, originalCost: e.target.value })} />
              <Input label="Proposed Cost (£)" type="number" min="0" step="0.01" value={form.proposedCost} onChange={(e) => setForm({ ...form, proposedCost: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Original Schedule (days)" type="number" min="0" value={form.originalScheduleDays} onChange={(e) => setForm({ ...form, originalScheduleDays: e.target.value })} />
              <Input label="Proposed Schedule (days)" type="number" min="0" value={form.proposedScheduleDays} onChange={(e) => setForm({ ...form, proposedScheduleDays: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Requested By" value={form.requestedBy} onChange={(e) => setForm({ ...form, requestedBy: e.target.value })} />
              <Input label="Requested Date" type="date" value={form.requestedDate} onChange={(e) => setForm({ ...form, requestedDate: e.target.value })} />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
              <textarea className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[60px]"
                value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Link href="/dashboard/change-orders"><Button type="button" variant="outline">Cancel</Button></Link>
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? 'Creating...' : 'Create Change Order'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
