'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatDate } from '@/lib/utils';
import { Search, Plus, AlertTriangle, Shield } from 'lucide-react';

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  date: string;
  injuries: number;
  project_name: string;
}

const severityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-amber-100 text-amber-700',
  critical: 'bg-red-100 text-red-700',
};

const statusColors: Record<string, string> = {
  open: 'bg-red-100 text-red-700',
  investigating: 'bg-amber-100 text-amber-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-700',
};

export default function SafetyPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['incidents', search],
    queryFn: async () => {
      const res = await api.get('/safety/incidents', { params: { search } });
      return res.data;
    },
  });

  const incidents = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Safety Incidents</h1>
        <Link href="/dashboard/safety/create">
          <Button><Plus className="mr-2 h-4 w-4" /> Report Incident</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search incidents..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : incidents.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-12">
              <Shield className="h-12 w-12 text-green-300" />
              <p className="mt-4 text-gray-500">No safety incidents reported. Great job!</p>
            </CardContent>
          </Card>
        ) : (
          incidents.map((incident: Incident) => (
            <Link key={incident.id} href={`/dashboard/safety/${incident.id}`}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`h-5 w-5 ${incident.severity === 'critical' ? 'text-red-500' : 'text-amber-500'}`} />
                    <div>
                      <h3 className="font-semibold text-gray-900">{incident.title}</h3>
                      <p className="text-sm text-gray-500">{incident.project_name}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${severityColors[incident.severity]}`}>
                      {incident.severity}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[incident.status]}`}>
                      {incident.status}
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600">{incident.description}</p>
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                  <span>{formatDate(incident.date)}</span>
                  {incident.injuries > 0 && (
                    <span className="text-red-500">{incident.injuries} injuries</span>
                  )}
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
