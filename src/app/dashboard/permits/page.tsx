'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatDate } from '@/lib/utils';
import { Search, Plus, FileText } from 'lucide-react';
import Link from 'next/link';

interface Permit {
  id: string;
  title: string;
  type: string;
  status: string;
  location: string;
  issuedBy: string;
  issuedTo: string;
  validFrom: string;
  validTo: string;
  riskLevel: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  pending: 'bg-amber-100 text-amber-700',
  active: 'bg-green-100 text-green-700',
  expired: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

const riskColors: Record<string, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-amber-100 text-amber-700',
  critical: 'bg-red-100 text-red-700',
};

export default function PermitsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['permits', search, statusFilter],
    queryFn: async () => {
      const res = await api.get('/permits', { params: { search, status: statusFilter } });
      return res.data;
    },
  });

  const permits = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Permits</h1>
        <Link href="/dashboard/permits/create">
          <Button><Plus className="mr-2 h-4 w-4" /> New Permit</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search permits..."
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
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-gray-500">Loading permits...</p>
        ) : permits.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-300" />
              <p className="mt-4 text-gray-500">No permits found.</p>
            </CardContent>
          </Card>
        ) : (
          permits.map((permit: Permit) => (
            <Link key={permit.id} href={`/dashboard/permits/${permit.id}`}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">{permit.title}</h3>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${riskColors[permit.riskLevel]}`}>
                        {permit.riskLevel} risk
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{permit.type.replace(/_/g, ' ')}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                      {permit.location && <span>{permit.location}</span>}
                      {permit.issuedBy && <span>•</span>}
                      {permit.issuedBy && <span>Issued by {permit.issuedBy}</span>}
                      {permit.issuedTo && <span>•</span>}
                      {permit.issuedTo && <span>To {permit.issuedTo}</span>}
                    </div>
                    {(permit.validFrom || permit.validTo) && (
                      <div className="mt-2 text-xs text-gray-400">
                        {permit.validFrom && <span>From {formatDate(permit.validFrom)}</span>}
                        {permit.validTo && <span> • To {formatDate(permit.validTo)}</span>}
                      </div>
                    )}
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[permit.status] || 'bg-gray-100'}`}>
                    {permit.status}
                  </span>
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
