'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';

const roleOptions = ['foreman', 'electrician', 'plumber', 'carpenter', 'mason', 'laborer', 'engineer', 'safety-officer'];

export default function CreateWorkerPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [role, setRole] = useState('laborer');
  const [status, setStatus] = useState('active');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [weeklyHours, setWeeklyHours] = useState('');
  const [error, setError] = useState('');

  const createWorker = useMutation({
    mutationFn: async () => {
      const res = await api.post('/workers', {
        name,
        role,
        status,
        phone: phone || undefined,
        email: email || undefined,
        hourlyRate: parseFloat(hourlyRate) || 0,
        weeklyHours: parseFloat(weeklyHours) || 0,
      });
      return res.data;
    },
    onSuccess: () => {
      router.push('/dashboard/workers');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || err.message || 'Failed to create worker');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    createWorker.mutate();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/workers">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add Worker</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="mt-1" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  {roleOptions.map((r) => (
                    <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="off-duty">Off-duty</option>
                  <option value="on-leave">On-leave</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+44..." className="mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@..." className="mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Hourly Rate (£)</label>
                <Input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} placeholder="0.00" className="mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Weekly Hours</label>
                <Input type="number" value={weeklyHours} onChange={(e) => setWeeklyHours(e.target.value)} placeholder="40" className="mt-1" />
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end gap-2">
              <Link href="/dashboard/workers">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={createWorker.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {createWorker.isPending ? 'Saving...' : 'Add Worker'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
