'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Plus, Users, Phone, Mail } from 'lucide-react';

interface Worker {
  id: string;
  name: string;
  role: string;
  status: string;
  phone: string;
  email: string;
  hourly_rate: number;
  weekly_hours: number;
}

const roleColors: Record<string, string> = {
  foreman: 'bg-purple-100 text-purple-700',
  electrician: 'bg-yellow-100 text-yellow-700',
  plumber: 'bg-cyan-100 text-cyan-700',
  carpenter: 'bg-amber-100 text-amber-700',
  mason: 'bg-orange-100 text-orange-700',
  laborer: 'bg-gray-100 text-gray-700',
  engineer: 'bg-blue-100 text-blue-700',
  'safety-officer': 'bg-red-100 text-red-700',
};

export default function WorkersPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['workers', search],
    queryFn: async () => {
      const res = await api.get('/workers', { params: { search } });
      return res.data;
    },
  });

  const workers = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Workers</h1>
        <Link href="/dashboard/workers/create">
          <Button><Plus className="mr-2 h-4 w-4" /> Add Worker</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search workers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : workers.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center py-12">
              <Users className="h-12 w-12 text-gray-300" />
              <p className="mt-4 text-gray-500">No workers added yet.</p>
            </CardContent>
          </Card>
        ) : (
          workers.map((worker: Worker) => (
            <Link key={worker.id} href={`/dashboard/workers/${worker.id}`}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{worker.name}</h3>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${roleColors[worker.role] || 'bg-gray-100'}`}>
                    {worker.role}
                  </span>
                </div>
                <div className="mt-3 space-y-1 text-sm text-gray-500">
                  {worker.phone && (
                    <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" />{worker.phone}</div>
                  )}
                  {worker.email && (
                    <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" />{worker.email}</div>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-gray-500">${worker.hourly_rate}/hr</span>
                  <span className="text-gray-500">{worker.weekly_hours}h/week</span>
                </div>
              </CardContent>
            </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
