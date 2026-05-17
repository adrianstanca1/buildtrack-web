'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Plus, FileText, AlertTriangle, CheckCircle, XCircle, Clock, PoundSterling, Calendar } from 'lucide-react';

interface ChangeOrder {
  id: string;
  project_name: string;
  co_number: string;
  title: string;
  type: string;
  status: string;
  original_cost: number;
  proposed_cost: number;
  impact_cost: number;
  original_schedule_days: number;
  proposed_schedule_days: number;
  impact_days: number;
  requested_by: string;
  requested_date: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-blue-100 text-blue-700',
  under_review: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-gray-100 text-gray-500',
};

const typeLabels: Record<string, string> = {
  scope: 'Scope',
  price: 'Price',
  time: 'Time',
  design: 'Design',
  other: 'Other',
};

export default function ChangeOrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['change-orders', search, statusFilter, typeFilter],
    queryFn: async () => {
      const res = await api.get('/change-orders', {
        params: { search, status: statusFilter || undefined, type: typeFilter || undefined },
      });
      return res.data;
    },
  });

  const items = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Change Orders</h1>
        <Link href="/dashboard/change-orders/create">
          <Button><Plus className="mr-2 h-4 w-4" /> New Change Order</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by CO # or title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:w-36"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              {Object.keys(statusColors).map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
            <select
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:w-36"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              {Object.keys(typeLabels).map((t) => <option key={t} value={t}>{typeLabels[t]}</option>)}
            </select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="py-12 text-center text-gray-500">Loading change orders...</div>
      ) : items.length === 0 ? (
        <div className="py-12 text-center text-gray-400">
          <FileText className="mx-auto mb-3 h-12 w-12 opacity-40" />
          <p className="text-lg font-medium">No change orders yet</p>
          <p className="text-sm">Add your first change order to track scope changes and cost impacts.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((co: ChangeOrder) => (
            <Link key={co.id} href={`/dashboard/change-orders/${co.id}`}>
            <Card className="cursor-pointer transition hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-700">
                        {co.co_number}
                      </span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[co.status] || statusColors.draft}`}>
                        {co.status.replace('_', ' ')}
                      </span>
                      <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600">
                        {typeLabels[co.type] || co.type}
                      </span>
                    </div>
                    <h3 className="mt-1 text-lg font-semibold text-gray-900 truncate">{co.title}</h3>
                    <p className="text-sm text-gray-500">{co.project_name || 'Unassigned'}</p>

                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-400">Original Cost</p>
                        <p className="text-sm font-medium text-gray-700">{co.original_cost > 0 ? `£${co.original_cost.toLocaleString()}` : '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Proposed Cost</p>
                        <p className="text-sm font-medium text-gray-700">{co.proposed_cost > 0 ? `£${co.proposed_cost.toLocaleString()}` : '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Impact</p>
                        <p className={`text-sm font-medium ${(co.impact_cost || 0) > 0 ? 'text-red-600' : (co.impact_cost || 0) < 0 ? 'text-green-600' : 'text-gray-700'}`}>
                          {(co.impact_cost || 0) !== 0 ? `£${co.impact_cost?.toLocaleString()}` : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Days Impact</p>
                        <p className={`text-sm font-medium ${(co.impact_days || 0) > 0 ? 'text-red-600' : 'text-gray-700'}`}>
                          {(co.impact_days || 0) !== 0 ? `${co.impact_days > 0 ? '+' : ''}${co.impact_days} days` : '—'}
                        </p>
                      </div>
                    </div>

                    {co.requested_by && (
                      <p className="mt-2 text-xs text-gray-400">Requested by {co.requested_by} on {co.requested_date ? new Date(co.requested_date).toLocaleDateString() : 'N/A'}</p>
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
