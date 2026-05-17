'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Plus, Clock, CheckCircle, XCircle, DollarSign, Calendar } from 'lucide-react';

interface TimesheetEntry {
  id: string;
  project_name: string;
  worker_name: string;
  worker_role: string;
  entry_date: string;
  hours_worked: number;
  overtime_hours: number;
  hourly_rate: number;
  total_pay: number;
  category: string;
  status: string;
  work_description: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  submitted: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  paid: 'bg-emerald-100 text-emerald-700',
};

const categoryColors: Record<string, string> = {
  regular: 'text-gray-500',
  overtime: 'text-amber-600',
  weekend: 'text-purple-600',
  holiday: 'text-pink-600',
  sick: 'text-red-500',
  leave: 'text-blue-500',
};

export default function TimesheetsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['timesheets', search, statusFilter, dateFilter],
    queryFn: async () => {
      const res = await api.get('/timesheets', {
        params: { search, status: statusFilter || undefined, entryDate: dateFilter || undefined },
      });
      return res.data;
    },
  });

  const entries = data?.data || [];
  const totalHours = entries.reduce((s: number, e: TimesheetEntry) => s + (e.hours_worked || 0) + (e.overtime_hours || 0), 0);
  const totalPay = entries.reduce((s: number, e: TimesheetEntry) => s + (e.total_pay || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timesheets</h1>
          <p className="text-sm text-gray-500">
            {entries.length} entries • {totalHours.toFixed(1)} hrs • £{totalPay.toFixed(2)}
          </p>
        </div>
        <Link href="/dashboard/timesheets/create">
          <Button><Plus className="mr-2 h-4 w-4" /> Log Hours</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search timesheets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="sm:w-40"
            />
            <select
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:w-44"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="py-12 text-center text-gray-500">Loading timesheets...</div>
      ) : entries.length === 0 ? (
        <div className="py-12 text-center text-gray-400">
          <Clock className="mx-auto mb-3 h-12 w-12 opacity-40" />
          <p className="text-lg font-medium">No timesheet entries yet</p>
          <p className="text-sm">Log hours to track labour costs.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry: TimesheetEntry) => (
            <Link key={entry.id} href={`/dashboard/timesheets/${entry.id}`}>
            <Card className="cursor-pointer transition hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[entry.status] || statusColors.submitted}`}>
                        {entry.status}
                      </span>
                      <span className={`text-xs font-medium ${categoryColors[entry.category] || categoryColors.regular}`}>
                        {entry.category}
                      </span>
                    </div>
                    <h3 className="mt-1 text-base font-semibold text-gray-900">
                      {entry.worker_name} {entry.worker_role && <span className="font-normal text-gray-500">({entry.worker_role})</span>}
                    </h3>
                    <p className="text-sm text-gray-500">{entry.project_name}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(entry.entry_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {entry.hours_worked} hrs
                        {entry.overtime_hours > 0 && <span className="text-amber-600">+{entry.overtime_hours} OT</span>}
                      </span>
                      <span className="flex items-center gap-1 font-medium text-gray-700">
                        <DollarSign className="h-3.5 w-3.5" />
                        £{entry.total_pay?.toFixed(2)}
                      </span>
                    </div>
                    {entry.work_description && (
                      <p className="mt-1 text-xs text-gray-400 line-clamp-2">{entry.work_description}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
