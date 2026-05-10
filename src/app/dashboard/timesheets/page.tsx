'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatDate } from '@/lib/utils';
import { Search, Plus, Clock } from 'lucide-react';
import Link from 'next/link';

interface Timesheet {
  id: string;
  workerName: string;
  projectName: string;
  weekStarting: string;
  totalHours: string;
  overtimeHours: string;
  status: string;
  submittedAt: string;
  approvedBy: string;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function TimesheetsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['timesheets', search, statusFilter],
    queryFn: async () => {
      const res = await api.get('/timesheets', { params: { search, status: statusFilter } });
      return res.data;
    },
  });

  const timesheets = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Timesheets</h1>
        <Link href="/dashboard/timesheets/create">
          <Button><Plus className="mr-2 h-4 w-4" /> New Timesheet</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search timesheets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-gray-500">Loading timesheets...</p>
        ) : timesheets.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="h-12 w-12 text-gray-300" />
              <p className="mt-4 text-gray-500">No timesheets found.</p>
            </CardContent>
          </Card>
        ) : (
          timesheets.map((ts: Timesheet) => (
            <Card key={ts.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">{ts.workerName}</h3>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[ts.status]}`}>
                        {ts.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{ts.projectName || 'No project'}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                      <span>Week starting {formatDate(ts.weekStarting)}</span>
                      <span>•</span>
                      <span>{ts.totalHours} hrs</span>
                      {Number(ts.overtimeHours) > 0 && (
                        <span className="text-amber-600">+{ts.overtimeHours} OT</span>
                      )}
                    </div>
                    {ts.approvedBy && (
                      <div className="mt-1 text-xs text-gray-400">
                        Approved by {ts.approvedBy}
                      </div>
                    )}
                  </div>
                  {ts.submittedAt && (
                    <div className="text-xs text-gray-400">
                      Submitted {formatDate(ts.submittedAt)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
