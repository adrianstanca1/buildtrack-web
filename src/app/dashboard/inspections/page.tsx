'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatDate } from '@/lib/utils';
import { Search, Plus, ClipboardCheck, CheckCircle2, XCircle } from 'lucide-react';

interface Inspection {
  id: string;
  title: string;
  inspector_name: string;
  description: string;
  status: string;
  date: string;
  project_name: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  passed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <ClipboardCheck className="h-5 w-5 text-amber-500" />,
  passed: <CheckCircle2 className="h-5 w-5 text-green-500" />,
  failed: <XCircle className="h-5 w-5 text-red-500" />,
};

export default function InspectionsPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['inspections', search],
    queryFn: async () => {
      const res = await api.get('/inspections', { params: { search } });
      return res.data;
    },
  });

  const inspections = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Inspections</h1>
        <Link href="/dashboard/inspections/create"><Button><Plus className="mr-2 h-4 w-4" /> New Inspection</Button></Link>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search inspections..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : inspections.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-12">
              <ClipboardCheck className="h-12 w-12 text-gray-300" />
              <p className="mt-4 text-gray-500">No inspections recorded.</p>
            </CardContent>
          </Card>
        ) : (
          inspections.map((inspection: Inspection) => (
            <Link key={inspection.id} href={`/dashboard/inspections/${inspection.id}`}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="flex items-start gap-4 p-5">
                <div className="mt-0.5">{statusIcons[inspection.status] || statusIcons.pending}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{inspection.title}</h3>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[inspection.status]}`}>
                      {inspection.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{inspection.description}</p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                    <span>{inspection.project_name}</span>
                    <span>•</span>
                    <span>{inspection.inspector_name || 'Unknown inspector'}</span>
                    <span>•</span>
                    <span>{formatDate(inspection.date)}</span>
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
