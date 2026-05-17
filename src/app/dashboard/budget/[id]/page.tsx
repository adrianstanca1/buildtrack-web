'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Pencil, Trash2, Save, X, PoundSterling } from 'lucide-react';

interface CostEntry {
  id: string;
  project_name: string;
  category_name: string;
  entry_type: string;
  description: string;
  amount: number;
  quantity: number;
  unit: string;
  vendor: string;
  cost_code: string;
  date: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export default function CostEntryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<Partial<CostEntry>>({});

  const { data, isLoading } = useQuery<CostEntry>({
    queryKey: ['cost-entry', id],
    queryFn: async () => {
      const res = await api.get(`/budget/costs/${id}`);
      return res.data.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (body: Partial<CostEntry>) => {
      const res = await api.patch(`/budget/costs/${id}`, body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-entry', id] });
      queryClient.invalidateQueries({ queryKey: ['cost-entries'] });
      setIsEditing(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/budget/costs/${id}`);
    },
    onSuccess: () => {
      router.push('/dashboard/budget');
    },
  });

  if (isLoading || !data) {
    return <div className="py-12 text-center text-gray-500">Loading cost entry...</div>;
  }

  const entry = data;

  const handleSave = () => {
    updateMutation.mutate(form);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this cost entry?')) {
      deleteMutation.mutate();
    }
  };

  const typeColors: Record<string, string> = {
    budget: 'bg-purple-100 text-purple-700',
    actual: 'bg-blue-100 text-blue-700',
    forecast: 'bg-amber-100 text-amber-700',
    commitment: 'bg-indigo-100 text-indigo-700',
    variance: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/budget')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Cost Entry Details</h1>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                <X className="mr-1 h-4 w-4" /> Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
                <Save className="mr-1 h-4 w-4" /> Save
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => { setForm(entry); setIsEditing(true); }}>
                <Pencil className="mr-1 h-4 w-4" /> Edit
              </Button>
              <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleteMutation.isPending}>
                <Trash2 className="mr-1 h-4 w-4" /> Delete
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Input
                  value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Amount (£)</label>
                <Input
                  type="number"
                  value={form.amount || 0}
                  onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Entry Type</label>
                <select
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={form.entry_type || 'actual'}
                  onChange={(e) => setForm({ ...form, entry_type: e.target.value })}
                >
                  <option value="budget">Budget</option>
                  <option value="actual">Actual</option>
                  <option value="forecast">Forecast</option>
                  <option value="commitment">Commitment</option>
                  <option value="variance">Variance</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Vendor</label>
                <Input
                  value={form.vendor || ''}
                  onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Cost Code</label>
                <Input
                  value={form.cost_code || ''}
                  onChange={(e) => setForm({ ...form, cost_code: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Date</label>
                <Input
                  type="date"
                  value={form.date ? new Date(form.date).toISOString().split('T')[0] : ''}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={form.notes || ''}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColors[entry.entry_type] || 'bg-gray-100 text-gray-700'}`}>
                    {entry.entry_type}
                  </span>
                  <h2 className="mt-2 text-xl font-semibold text-gray-900">{entry.description || 'Untitled'}</h2>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">£{entry.amount?.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-500">Project</p>
                  <p className="font-medium text-gray-900">{entry.project_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium text-gray-900">{entry.category_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Vendor</p>
                  <p className="font-medium text-gray-900">{entry.vendor || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cost Code</p>
                  <p className="font-medium text-gray-900">{entry.cost_code || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Quantity</p>
                  <p className="font-medium text-gray-900">{entry.quantity} {entry.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium text-gray-900">{entry.date ? new Date(entry.date).toLocaleDateString() : '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium text-gray-900">{new Date(entry.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {entry.notes && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="mt-1 text-gray-700">{entry.notes}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
