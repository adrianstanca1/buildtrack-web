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
  { value: 'excavator', label: 'Excavator' },
  { value: 'bulldozer', label: 'Bulldozer' },
  { value: 'crane', label: 'Crane' },
  { value: 'loader', label: 'Loader' },
  { value: 'dump_truck', label: 'Dump Truck' },
  { value: 'mixer', label: 'Mixer' },
  { value: 'generator', label: 'Generator' },
  { value: 'scaffold', label: 'Scaffold' },
  { value: 'scissor_lift', label: 'Scissor Lift' },
  { value: 'forklift', label: 'Forklift' },
  { value: 'compactor', label: 'Compactor' },
  { value: 'other', label: 'Other' },
];

const statusOptions = [
  { value: 'available', label: 'Available' },
  { value: 'rented', label: 'Rented' },
  { value: 'on_site', label: 'On Site' },
  { value: 'under_maintenance', label: 'Under Maintenance' },
  { value: 'out_of_service', label: 'Out of Service' },
  { value: 'retired', label: 'Retired' },
];

export default function CreateEquipmentPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    projectId: '',
    name: '',
    type: 'other',
    make: '',
    model: '',
    serialNumber: '',
    year: '',
    status: 'available',
    dailyRate: '',
    purchasePrice: '',
    purchaseDate: '',
    insuranceExpiry: '',
    motExpiry: '',
    location: '',
    notes: '',
  });

  const create = useMutation({
    mutationFn: async () => {
      const res = await api.post('/equipment', {
        projectId: form.projectId || undefined,
        name: form.name,
        type: form.type,
        make: form.make || undefined,
        model: form.model || undefined,
        serialNumber: form.serialNumber || undefined,
        year: form.year ? parseInt(form.year) : undefined,
        status: form.status,
        dailyRate: form.dailyRate ? parseFloat(form.dailyRate) : undefined,
        purchasePrice: form.purchasePrice ? parseFloat(form.purchasePrice) : undefined,
        purchaseDate: form.purchaseDate || undefined,
        insuranceExpiry: form.insuranceExpiry || undefined,
        motExpiry: form.motExpiry || undefined,
        location: form.location || undefined,
        notes: form.notes || undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      router.push('/dashboard/equipment');
    },
    onError: (err: any) => {
      setError(err.response?.data?.error?.message || 'Failed to create equipment');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name) {
      setError('Equipment name is required');
      return;
    }
    create.mutate();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/equipment">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Equipment</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Equipment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-red-600">{error}</p>}

            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
                <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} >
                  {typeOptions.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} >
                  {statusOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Make" value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} />
              <Input label="Model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Serial Number" value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} />
              <Input label="Year" type="number" min="1900" max={new Date().getFullYear() + 1} value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Daily Rate (£)" type="number" min="0" step="0.01" value={form.dailyRate} onChange={(e) => setForm({ ...form, dailyRate: e.target.value })} />
              <Input label="Purchase Price (£)" type="number" min="0" step="0.01" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Purchase Date" type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} />
              <Input label="Project ID" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} placeholder="Optional project assignment" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Insurance Expiry" type="date" value={form.insuranceExpiry} onChange={(e) => setForm({ ...form, insuranceExpiry: e.target.value })} />
              <Input label="MOT Expiry" type="date" value={form.motExpiry} onChange={(e) => setForm({ ...form, motExpiry: e.target.value })} />
            </div>

            <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Where is the equipment currently?" />

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
              <textarea className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[60px]"
                value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Link href="/dashboard/equipment"><Button type="button" variant="outline">Cancel</Button></Link>
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? 'Creating...' : 'Create Equipment'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
