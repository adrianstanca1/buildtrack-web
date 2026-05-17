'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatDate } from '@/lib/utils';
import { Search, Plus, AlertCircle } from 'lucide-react';

interface PunchItem {
  id: string;
  title: string;
  description: string;
  location: string;
  severity: string;
  status: string;
  assignedTo: string;
  createdBy: string;
  createdAt: string;
  projectId: number;
  projectName: string;
}

const severityColors: Record<string, string> = {
  minor: 'bg-gray-100 text-gray-700',
  major: 'bg-amber-100 text-amber-700',
  critical: 'bg-red-100 text-red-700',
};

const statusColors: Record<string, string> = {
  open: 'bg-red-100 text-red-700',
  in_progress: 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-700',
};

export default function PunchItemsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['punch-items', search, statusFilter, severityFilter],
    queryFn: async () => {
      const res = await api.get('/punch-items', {
        params: { search, status: statusFilter || undefined, severity: severityFilter || undefined },
      });
      return res.data;
    },
  });

  const items = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Punch Items</h1>
        <Link href="/dashboard/punch-items/create">
          <Button><Plus className="mr-2 h-4 w-4" /> New Punch Item</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search punch items..."
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
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="">All Severity</option>
            <option value="minor">Minor</option>
            <option value="major">Major</option>
            <option value="critical">Critical</option>
          </select>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-gray-500">Loading punch items...</p>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-300" />
              <p className="mt-4 text-gray-500">No punch items found.</p>
            </CardContent>
          </Card>
        ) : (
          items.map((item: PunchItem) => (
            <Link key={item.id} href={`/dashboard/punch-items/${item.id}`}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${severityColors[item.severity] || 'bg-gray-100'}`}>
                        {item.severity}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                      {item.location && <span>{item.location}</span>}
                      {item.projectName && (
                        <>
                          <span>•</span>
                          <span>{item.projectName}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>Created by {item.createdBy}</span>
                      {item.assignedTo && (
                        <>
                          <span>•</span>
                          <span>Assigned to {item.assignedTo}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[item.status] || 'bg-gray-100'}`}>
                    {item.status}
                  </span>
                </div>
                <div className="mt-3 text-xs text-gray-400">
                  <span>{formatDate(item.createdAt)}</span>
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
