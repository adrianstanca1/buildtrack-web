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

const typeOptions = [
  { value: 'budget', label: 'Budget' },
  { value: 'actual', label: 'Actual' },
  { value: 'forecast', label: 'Forecast' },
  { value: 'commitment', label: 'Commitment' },
  { value: 'variance', label: 'Variance' },
];

export default function CreateCostEntryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    projectId: '',
    budgetCategoryId: '',
    entryType: 'actual',
    description: '',
    amount: '',
    quantity: '1',
    unit: '',
    vendor: '',
    costCode: '',
    date: '',
    linkedPoId: '',
    linkedCoId: '',
    linkedInvoiceId: '',
    linkedTimesheetId: '',
    notes: '',
  });

  const create = useMutation({
    mutationFn: async () => {
      const res = await api.post('/budget/costs', {
        projectId: form.projectId || undefined,
        budgetCategoryId: form.budgetCategoryId || undefined,
        entryType: form.entryType,
        description: form.description || undefined,
        amount: form.amount ? parseFloat(form.amount) : 0,
        quantity: form.quantity ? parseFloat(form.quantity) : 1,
        unit: form.unit || undefined,
        vendor: form.vendor || undefined,
        costCode: form.costCode || undefined,
        date: form.date || undefined,
        linkedPoId: form.linkedPoId || undefined,
        linkedCoId: form.linkedCoId || undefined,
        linkedInvoiceId: form.linkedInvoiceId || undefined,
        linkedTimesheetId: form.linkedTimesheetId || undefined,
        notes: form.notes || undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-entries'] });
      router.push('/dashboard/budget');
    },
    onError: (err: any) => {
      setError(err.response?.data?.error?.message || 'Failed to create cost entry');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    create.mutate();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/budget">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Cost Entry</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cost Entry Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
                <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={form.entryType} onChange={(e) => setForm({ ...form, entryType: e.target.value })}>
                  {typeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <Input label="Project ID" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} placeholder="Optional" />
            </div>

            <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

            <div className="grid grid-cols-2 gap-4">
              <Input label="Amount (£) *" type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
              <Input label="Cost Code" value={form.costCode} onChange={(e) => setForm({ ...form, costCode: e.target.value })} placeholder="e.g. 01-1000" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Quantity" type="number" min="0" step="any" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
              <Input label="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="e.g. m³, hrs" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Vendor" value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} />
              <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Linked PO ID" value={form.linkedPoId} onChange={(e) => setForm({ ...form, linkedPoId: e.target.value })} placeholder="Optional" />
              <Input label="Linked CO ID" value={form.linkedCoId} onChange={(e) => setForm({ ...form, linkedCoId: e.target.value })} placeholder="Optional" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
              <textarea className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[60px]"
                value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Link href="/dashboard/budget"><Button type="button" variant="outline">Cancel</Button></Link>
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? 'Creating...' : 'Create Entry'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
