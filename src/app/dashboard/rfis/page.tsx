'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Plus, FileQuestion, MessageSquare } from 'lucide-react';

interface RFI {
  id: string;
  project_name: string;
  subject: string;
  question: string;
  status: string;
  priority: string;
  due_date: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  submitted: 'bg-blue-100 text-blue-700',
  open: 'bg-amber-100 text-amber-700',
  answered: 'bg-green-100 text-green-700',
  approved: 'bg-purple-100 text-purple-700',
  rejected: 'bg-red-100 text-red-700',
  closed: 'bg-gray-100 text-gray-700',
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  normal: 'bg-blue-50 text-blue-600',
  high: 'bg-amber-100 text-amber-700',
  urgent: 'bg-red-100 text-red-700',
};

export default function RFIsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['rfis', search, statusFilter],
    queryFn: async () => {
      const res = await api.get('/rfis', {
        params: { search, status: statusFilter || undefined },
      });
      return res.data;
    },
  });

  const rfis = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">RFIs</h1>
        <Link href="/dashboard/rfis/create">
          <Button><Plus className="mr-2 h-4 w-4" /> New RFI</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search RFIs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="sm:w-48">
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="open">Open</option>
                <option value="answered">Answered</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : rfis.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileQuestion className="h-12 w-12 text-gray-300" />
              <p className="mt-4 text-gray-500">No RFIs found.</p>
            </CardContent>
          </Card>
        ) : (
          rfis.map((rfi: RFI) => (
            <Link key={rfi.id} href={`/dashboard/rfis/${rfi.id}`}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">{rfi.subject}</h3>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[rfi.status] || 'bg-gray-100'}`}>
                        {rfi.status}
                      </span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityColors[rfi.priority] || 'bg-gray-100'}`}>
                        {rfi.priority}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{rfi.project_name}</p>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">{rfi.question}</p>
                    {rfi.due_date && (
                      <p className="mt-2 text-xs text-gray-400">Due: {new Date(rfi.due_date).toLocaleDateString('en-GB')}</p>
                    )}
                  </div>
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
