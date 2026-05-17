'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Plus, Calendar, Clock, MapPin, Users, CheckCircle, XCircle } from 'lucide-react';

interface Meeting {
  id: string;
  project_name: string;
  title: string;
  meeting_type: string;
  scheduled_at: string;
  duration_minutes: number;
  location: string;
  status: string;
  agenda: string;
  notes: string;
  attendees: Array<{ id: string; name: string; role: string; present: boolean }>;
  created_at: string;
}

const typeLabels: Record<string, string> = {
  safety_toolbox: 'Safety Toolbox',
  standup: 'Standup',
  client_walkthrough: 'Client Walkthrough',
  change_order: 'Change Order',
  quality_review: 'Quality Review',
  progress_review: 'Progress Review',
  closeout: 'Closeout',
  other: 'Other',
};

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

export default function MeetingsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['meetings', search, statusFilter, typeFilter],
    queryFn: async () => {
      const res = await api.get('/meetings', {
        params: { search, status: statusFilter || undefined, meetingType: typeFilter || undefined },
      });
      return res.data;
    },
  });

  const meetings = data?.data || [];

  const presentCount = (attendees: any[]) =>
    attendees?.filter((a) => a.present).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
        <Link href="/dashboard/meetings/create">
          <Button><Plus className="mr-2 h-4 w-4" /> New Meeting</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search meetings..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:w-40"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:w-44"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              {Object.entries(typeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="py-12 text-center text-gray-500">Loading meetings...</div>
      ) : meetings.length === 0 ? (
        <div className="py-12 text-center text-gray-400">
          <Calendar className="mx-auto mb-3 h-12 w-12 opacity-40" />
          <p className="text-lg font-medium">No meetings yet</p>
          <p className="text-sm">Schedule your first project meeting.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {meetings.map((m: Meeting) => (
            <Link key={m.id} href={`/dashboard/meetings/${m.id}`}>
            <Card className="cursor-pointer transition hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[m.status] || statusColors.scheduled}`}>
                        {m.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-2.5 py-0.5">
                        {typeLabels[m.meeting_type] || 'Other'}
                      </span>
                    </div>
                    <h3 className="mt-1 text-lg font-semibold text-gray-900 truncate">{m.title}</h3>
                    <p className="text-sm text-gray-500">{m.project_name}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                      {m.scheduled_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(m.scheduled_at).toLocaleString()}
                        </span>
                      )}
                      {m.duration_minutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {m.duration_minutes} min
                        </span>
                      )}
                      {m.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {m.location}
                        </span>
                      )}
                      {m.attendees && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {presentCount(m.attendees)}/{m.attendees.length} present
                        </span>
                      )}
                    </div>
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
