'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Save, ClipboardCheck } from 'lucide-react';

const statusOptions = ['pending', 'passed', 'failed'];

export default function CreateInspectionPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [inspectorName, setInspectorName] = useState('');
  const [status, setStatus] = useState('pending');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [findings, setFindings] = useState('');
  const [error, setError] = useState('');

  const createInspection = useMutation({
    mutationFn: async () => {
      const res = await api.post('/inspections', {
        title,
        inspectorName: inspectorName || undefined,
        status,
        description: description || undefined,
        date: date ? new Date(date).toISOString() : new Date().toISOString(),
        findings: findings.split('\n').map((f) => f.trim()).filter(Boolean),
      });
      return res.data;
    },
    onSuccess: () => {
      router.push('/dashboard/inspections');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || err.message || 'Failed to create inspection');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    createInspection.mutate();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/inspections">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Schedule Inspection</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title *</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Inspection title" className="mt-1" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Inspector Name</label>
                <Input value={inspectorName} onChange={(e) => setInspectorName(e.target.value)} placeholder="Name" className="mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Inspection scope and notes..."
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Findings (one per line)</label>
              <textarea
                value={findings}
                onChange={(e) => setFindings(e.target.value)}
                placeholder="Issue 1&#10;Issue 2&#10;Issue 3"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                rows={4}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end gap-2">
              <Link href="/dashboard/inspections">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={createInspection.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {createInspection.isPending ? 'Saving...' : 'Schedule Inspection'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
