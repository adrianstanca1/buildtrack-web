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

const categoryOptions = [
  { value: 'concrete', label: 'Concrete' },
  { value: 'steel', label: 'Steel' },
  { value: 'timber', label: 'Timber' },
  { value: 'brick', label: 'Brick' },
  { value: 'block', label: 'Block' },
  { value: 'insulation', label: 'Insulation' },
  { value: 'roofing', label: 'Roofing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'paint', label: 'Paint' },
  { value: 'hardware', label: 'Hardware' },
  { value: 'aggregate', label: 'Aggregate' },
  { value: 'other', label: 'Other' },
];

export default function CreateMaterialPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    projectId: '',
    name: '',
    category: 'other',
    unit: '',
    unitCost: '',
    quantityOnHand: '',
    quantityOrdered: '',
    reorderLevel: '',
    reorderQuantity: '',
    supplierName: '',
    location: '',
    notes: '',
  });

  const create = useMutation({
    mutationFn: async () => {
      const res = await api.post('/materials', {
        projectId: form.projectId || undefined,
        name: form.name,
        category: form.category,
        unit: form.unit,
        unitCost: form.unitCost ? parseFloat(form.unitCost) : undefined,
        quantityOnHand: form.quantityOnHand ? parseFloat(form.quantityOnHand) : undefined,
        quantityOrdered: form.quantityOrdered ? parseFloat(form.quantityOrdered) : undefined,
        reorderLevel: form.reorderLevel ? parseFloat(form.reorderLevel) : undefined,
        reorderQuantity: form.reorderQuantity ? parseFloat(form.reorderQuantity) : undefined,
        supplierName: form.supplierName || undefined,
        location: form.location || undefined,
        notes: form.notes || undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      router.push('/dashboard/materials');
    },
    onError: (err: any) => {
      setError(err.response?.data?.error?.message || 'Failed to create material');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.unit) {
      setError('Name and unit are required');
      return;
    }
    create.mutate();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/materials">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Material</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Material Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-red-600">{error}</p>}

            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
                <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {categoryOptions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <Input label="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} required placeholder="e.g. m³, kg, pcs" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Unit Cost (£)" type="number" min="0" step="0.01" value={form.unitCost} onChange={(e) => setForm({ ...form, unitCost: e.target.value })} />
              <Input label="Quantity on Hand" type="number" min="0" step="any" value={form.quantityOnHand} onChange={(e) => setForm({ ...form, quantityOnHand: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Quantity Ordered" type="number" min="0" step="any" value={form.quantityOrdered} onChange={(e) => setForm({ ...form, quantityOrdered: e.target.value })} />
              <Input label="Project ID" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} placeholder="Optional" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Reorder Level" type="number" min="0" step="any" value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })} />
              <Input label="Reorder Quantity" type="number" min="0" step="any" value={form.reorderQuantity} onChange={(e) => setForm({ ...form, reorderQuantity: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Supplier" value={form.supplierName} onChange={(e) => setForm({ ...form, supplierName: e.target.value })} />
              <Input label="Storage Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
              <textarea className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[60px]"
                value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Link href="/dashboard/materials"><Button type="button" variant="outline">Cancel</Button></Link>
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? 'Creating...' : 'Create Material'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
