'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X } from 'lucide-react';
import Link from 'next/link';

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'acknowledged', label: 'Acknowledged' },
  { value: 'partially_delivered', label: 'Partially Delivered' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'invoiced', label: 'Invoiced' },
  { value: 'paid', label: 'Paid' },
  { value: 'cancelled', label: 'Cancelled' },
];

interface POItem {
  description: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  totalPrice: string;
}

export default function CreatePurchaseOrderPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    projectId: '',
    poNumber: '',
    title: '',
    description: '',
    vendorName: '',
    vendorEmail: '',
    vendorPhone: '',
    status: 'draft',
    taxRate: '',
    deliveryDate: '',
    expectedDelivery: '',
    deliveryAddress: '',
    notes: '',
  });
  const [items, setItems] = useState<POItem[]>([]);

  const create = useMutation({
    mutationFn: async () => {
      const itemsPayload = items
        .filter((i) => i.description.trim())
        .map((i) => ({
          description: i.description,
          quantity: parseFloat(i.quantity) || 0,
          unit: i.unit || undefined,
          unitPrice: parseFloat(i.unitPrice) || 0,
          totalPrice: parseFloat(i.totalPrice) || (parseFloat(i.quantity) || 0) * (parseFloat(i.unitPrice) || 0),
        }));
      const res = await api.post('/purchase-orders', {
        projectId: form.projectId,
        poNumber: form.poNumber,
        title: form.title,
        description: form.description || undefined,
        vendorName: form.vendorName,
        vendorEmail: form.vendorEmail || undefined,
        vendorPhone: form.vendorPhone || undefined,
        status: form.status,
        items: itemsPayload.length > 0 ? itemsPayload : undefined,
        taxRate: form.taxRate ? parseFloat(form.taxRate) : undefined,
        deliveryDate: form.deliveryDate || undefined,
        expectedDelivery: form.expectedDelivery || undefined,
        deliveryAddress: form.deliveryAddress || undefined,
        notes: form.notes || undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      router.push('/dashboard/purchase-orders');
    },
    onError: (err: any) => {
      setError(err.response?.data?.error?.message || 'Failed to create PO');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.projectId || !form.poNumber || !form.title || !form.vendorName) {
      setError('Project, PO number, title, and vendor name are required');
      return;
    }
    create.mutate();
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: '1', unit: '', unitPrice: '', totalPrice: '' }]);
  };

  const updateItem = (i: number, field: keyof POItem, value: string) => {
    const next = [...items];
    next[i] = { ...next[i], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      const q = parseFloat(next[i].quantity) || 0;
      const p = parseFloat(next[i].unitPrice) || 0;
      next[i].totalPrice = (q * p).toString();
    }
    setItems(next);
  };

  const removeItem = (i: number) => {
    setItems(items.filter((_, idx) => idx !== i));
  };

  const subtotal = items.reduce((s, it) => s + (parseFloat(it.totalPrice) || 0), 0);
  const taxRate = parseFloat(form.taxRate) || 0;
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/purchase-orders">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Purchase Order</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>PO Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="grid grid-cols-2 gap-4">
              <Input label="Project ID" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} required />
              <Input label="PO Number" value={form.poNumber} onChange={(e) => setForm({ ...form, poNumber: e.target.value })} required />
            </div>
            <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <Input label="Vendor Name" value={form.vendorName} onChange={(e) => setForm({ ...form, vendorName: e.target.value })} required />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Vendor Email" type="email" value={form.vendorEmail} onChange={(e) => setForm({ ...form, vendorEmail: e.target.value })} />
              <Input label="Vendor Phone" value={form.vendorPhone} onChange={(e) => setForm({ ...form, vendorPhone: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {statusOptions.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[60px]"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {/* Line Items */}
            <div className="rounded-lg border border-gray-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Line Items</span>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="mr-1 h-3.5 w-3.5" /> Add Item
                </Button>
              </div>
              {items.length === 0 && <p className="text-sm text-gray-400">No items added.</p>}
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <Input placeholder="Description" value={item.description} onChange={(e) => updateItem(i, 'description', e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <Input placeholder="Qty" type="number" min="0" step="any" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <Input placeholder="Unit" value={item.unit} onChange={(e) => updateItem(i, 'unit', e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <Input placeholder="Price" type="number" min="0" step="any" value={item.unitPrice} onChange={(e) => updateItem(i, 'unitPrice', e.target.value)} />
                  </div>
                  <div className="col-span-1">
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(i)}>
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
              {items.length > 0 && (
                <div className="border-t pt-3 space-y-1 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span>£{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Tax ({taxRate}%)</span>
                    <span>£{taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-gray-900 text-base">
                    <span>Total</span>
                    <span>£{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Tax Rate (%)" type="number" min="0" max="100" step="0.01" value={form.taxRate} onChange={(e) => setForm({ ...form, taxRate: e.target.value })} />
              <Input label="Delivery Date" type="date" value={form.deliveryDate} onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })} />
            </div>
            <Input label="Expected Delivery" value={form.expectedDelivery} onChange={(e) => setForm({ ...form, expectedDelivery: e.target.value })} placeholder="e.g. 3-5 business days" />
            <Input label="Delivery Address" value={form.deliveryAddress} onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })} />
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[60px]"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Link href="/dashboard/purchase-orders">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? 'Creating...' : 'Create PO'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
