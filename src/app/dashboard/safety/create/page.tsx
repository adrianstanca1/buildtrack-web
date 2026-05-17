'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';

const severityOptions = ['low', 'medium', 'high', 'critical'];

export default function CreateSafetyIncidentPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [injuries, setInjuries] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');

  const createIncident = useMutation({
    mutationFn: async () => {
      const res = await api.post('/safety/incidents', {
        title,
        description: description || undefined,
        severity,
        injuries: parseInt(injuries) || 0,
        date: date ? new Date(date).toISOString() : new Date().toISOString(),
      });
      return res.data;
    },
    onSuccess: () => {
      router.push('/dashboard/safety');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || err.message || 'Failed to report incident');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    createIncident.mutate();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/safety">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Report Safety Incident</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title *</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Incident title" className="mt-1" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Severity</label>
                <select
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                >
                  {severityOptions.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Injuries</label>
              <Input type="number" min="0" value={injuries} onChange={(e) => setInjuries(e.target.value)} placeholder="0" className="mt-1" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what happened..."
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                rows={4}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end gap-2">
              <Link href="/dashboard/safety">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={createIncident.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {createIncident.isPending ? 'Reporting...' : 'Report Incident'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
