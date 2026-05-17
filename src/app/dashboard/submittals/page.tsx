'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Plus, FileCheck, Clock, AlertCircle } from 'lucide-react';

interface Submittal {
  id: string;
  project_name: string;
  submittal_number: string;
  title: string;
  type: string;
  status: string;
  ball_in_court_email?: string;
  responsible_company?: string;
  due_date: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-blue-100 text-blue-700',
  under_review: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  approved_as_noted: 'bg-green-50 text-green-600',
  rejected: 'bg-red-100 text-red-700',
  resubmit: 'bg-orange-100 text-orange-700',
  closed: 'bg-gray-100 text-gray-500',
};

export default function SubmittalsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['submittals', search, statusFilter],
    queryFn: async () => {
      const res = await api.get('/submittals', {
        params: { search, status: statusFilter || undefined },
      });
      return res.data;
    },
  });

  const submittals = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Submittals</h1>
        <Link href="/dashboard/submittals/create">
          <Button><Plus className="mr-2 h-4 w-4" /> New Submittal</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search submittals..."
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
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="approved_as_noted">Approved as Noted</option>
                <option value="rejected">Rejected</option>
                <option value="resubmit">Resubmit</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : submittals.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileCheck className="h-12 w-12 text-gray-300" />
              <p className="mt-4 text-gray-500">No submittals found.</p>
            </CardContent>
          </Card>
        ) : (
          submittals.map((s: Submittal) => (
            <Link key={s.id} href={`/dashboard/submittals/${s.id}`}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">{s.submittal_number}</h3>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[s.status] || 'bg-gray-100'}`}>
                        {s.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{s.title}</p>
                    <p className="mt-1 text-sm text-gray-500">{s.project_name}</p>
                    {s.responsible_company && (
                      <p className="mt-1 text-xs text-gray-400">Company: {s.responsible_company}</p>
                    )}
                    {s.ball_in_court_email && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-amber-600">
                        <Clock className="h-3 w-3" />
                        <span>Ball in court: {s.ball_in_court_email}</span>
                      </div>
                    )}
                    {s.due_date && (
                      <div className={`mt-2 flex items-center gap-2 text-xs ${new Date(s.due_date) < new Date() ? 'text-red-600' : 'text-gray-400'}`}>
                        <AlertCircle className="h-3 w-3" />
                        <span>Due: {new Date(s.due_date).toLocaleDateString('en-GB')}</span>
                      </div>
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
