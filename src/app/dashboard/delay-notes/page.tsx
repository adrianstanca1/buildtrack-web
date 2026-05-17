'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatDate } from '@/lib/utils';
import { Search, Plus, Clock } from 'lucide-react';

interface DelayNote {
  id: string;
  title: string;
  reason: string;
  description: string;
  status: string;
  impactDays: number;
  linkedRfiId: string | null;
  linkedRfiSubject: string | null;
  reportedBy: string;
  createdAt: string;
  projectId: number;
  projectName: string;
}

const statusColors: Record<string, string> = {
  reported: 'bg-blue-100 text-blue-700',
  under_review: 'bg-amber-100 text-amber-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  mitigated: 'bg-purple-100 text-purple-700',
};

const reasonLabels: Record<string, string> = {
  weather: 'Weather',
  material_shortage: 'Material Shortage',
  design_change: 'Design Change',
  labour_shortage: 'Labour Shortage',
  equipment_failure: 'Equipment Failure',
  permit_delay: 'Permit Delay',
  subcontractor: 'Subcontractor',
  other: 'Other',
};

export default function DelayNotesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [reasonFilter, setReasonFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['delay-notes', search, statusFilter, reasonFilter],
    queryFn: async () => {
      const res = await api.get('/delay-notes', {
        params: { search, status: statusFilter || undefined, reason: reasonFilter || undefined },
      });
      return res.data;
    },
  });

  const notes = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Delay Notes</h1>
        <Link href="/dashboard/delay-notes/create">
          <Button><Plus className="mr-2 h-4 w-4" /> New Delay Note</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search delay notes..."
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
            <option value="reported">Reported</option>
            <option value="under_review">Under Review</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="mitigated">Mitigated</option>
          </select>
          <select
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
          >
            <option value="">All Reasons</option>
            <option value="weather">Weather</option>
            <option value="material_shortage">Material Shortage</option>
            <option value="design_change">Design Change</option>
            <option value="labour_shortage">Labour Shortage</option>
            <option value="equipment_failure">Equipment Failure</option>
            <option value="permit_delay">Permit Delay</option>
            <option value="subcontractor">Subcontractor</option>
            <option value="other">Other</option>
          </select>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-gray-500">Loading delay notes...</p>
        ) : notes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="h-12 w-12 text-gray-300" />
              <p className="mt-4 text-gray-500">No delay notes found.</p>
            </CardContent>
          </Card>
        ) : (
          notes.map((note: DelayNote) => (
            <Link key={note.id} href={`/dashboard/delay-notes/${note.id}`}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">{note.title}</h3>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[note.status] || 'bg-gray-100'}`}>
                        {note.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{note.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                      {note.projectName && <span>{note.projectName}</span>}
                      <span>•</span>
                      <span>Reason: {reasonLabels[note.reason] || note.reason}</span>
                      <span>•</span>
                      <span>Impact: {note.impactDays} day{note.impactDays !== 1 ? 's' : ''}</span>
                      <span>•</span>
                      <span>Reported by {note.reportedBy}</span>
                    </div>
                    {note.linkedRfiId && (
                      <div className="mt-2 text-xs text-blue-600">
                        Linked RFI: {note.linkedRfiSubject || note.linkedRfiId}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-400">
                  <span>{formatDate(note.createdAt)}</span>
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
