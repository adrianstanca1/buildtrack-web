'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X } from 'lucide-react';
import Link from 'next/link';

const meetingTypes = [
  { value: 'safety_toolbox', label: 'Safety Toolbox' },
  { value: 'standup', label: 'Standup' },
  { value: 'client_walkthrough', label: 'Client Walkthrough' },
  { value: 'change_order', label: 'Change Order' },
  { value: 'quality_review', label: 'Quality Review' },
  { value: 'progress_review', label: 'Progress Review' },
  { value: 'closeout', label: 'Closeout' },
  { value: 'other', label: 'Other' },
];

interface Attendee {
  name: string;
  role: string;
  email: string;
  present: boolean;
}

export default function CreateMeetingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    projectId: '',
    title: '',
    meetingType: 'standup',
    scheduledAt: '',
    durationMinutes: '',
    location: '',
    agenda: '',
    notes: '',
    status: 'scheduled',
  });
  const [attendees, setAttendees] = useState<Attendee[]>([]);

  const create = useMutation({
    mutationFn: async () => {
      const res = await api.post('/meetings', {
        projectId: form.projectId,
        title: form.title,
        meetingType: form.meetingType,
        scheduledAt: form.scheduledAt || undefined,
        durationMinutes: form.durationMinutes ? parseInt(form.durationMinutes) : undefined,
        location: form.location || undefined,
        agenda: form.agenda || undefined,
        notes: form.notes || undefined,
        status: form.status,
        attendees: attendees.length > 0 ? attendees : undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      router.push('/dashboard/meetings');
    },
    onError: (err: any) => {
      setError(err.response?.data?.error?.message || 'Failed to create meeting');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.projectId || !form.title) {
      setError('Project and title are required');
      return;
    }
    create.mutate();
  };

  const addAttendee = () => {
    setAttendees([...attendees, { name: '', role: '', email: '', present: false }]);
  };

  const updateAttendee = (i: number, field: keyof Attendee, value: string | boolean) => {
    const next = [...attendees];
    next[i] = { ...next[i], [field]: value };
    setAttendees(next);
  };

  const removeAttendee = (i: number) => {
    setAttendees(attendees.filter((_, idx) => idx !== i));
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/meetings">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Meeting</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meeting Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-red-600">{error}</p>}

            <Input
              label="Project ID"
              value={form.projectId}
              onChange={(e) => setForm({ ...form, projectId: e.target.value })}
              required
            />
            <Input
              label="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={form.meetingType}
                  onChange={(e) => setForm({ ...form, meetingType: e.target.value })}
                >
                  {meetingTypes.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Scheduled At"
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
              />
              <Input
                label="Duration (minutes)"
                type="number"
                min={1}
                max={480}
                value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
              />
            </div>

            <Input
              label="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="e.g. Site trailer, Conference room A"
            />

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Agenda</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[80px]"
                value={form.agenda}
                onChange={(e) => setForm({ ...form, agenda: e.target.value })}
                placeholder="List topics to cover..."
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[80px]"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Meeting minutes, decisions, action items..."
              />
            </div>

            <div className="rounded-lg border border-gray-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Attendees</span>
                <Button type="button" variant="outline" size="sm" onClick={addAttendee}>
                  <Plus className="mr-1 h-3.5 w-3.5" /> Add
                </Button>
              </div>
              {attendees.length === 0 && (
                <p className="text-sm text-gray-400">No attendees added.</p>
              )}
              {attendees.map((a, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-4">
                    <Input
                      placeholder="Name"
                      value={a.name}
                      onChange={(e) => updateAttendee(i, 'name', e.target.value)}
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      placeholder="Role"
                      value={a.role}
                      onChange={(e) => updateAttendee(i, 'role', e.target.value)}
                    />
                  </div>
                  <div className="col-span-4">
                    <Input
                      placeholder="Email"
                      type="email"
                      value={a.email}
                      onChange={(e) => updateAttendee(i, 'email', e.target.value)}
                    />
                  </div>
                  <div className="col-span-1">
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeAttendee(i)}>
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Link href="/dashboard/meetings">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? 'Creating...' : 'Create Meeting'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
