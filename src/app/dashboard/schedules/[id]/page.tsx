'use client';

import { EntityDetail } from '@/components/EntityDetail';

export default function ScheduleDetailPage() {
  return (
    <EntityDetail
      config={{
        entityName: 'Schedule task',
        pluralName: 'Schedules',
        apiPath: '/schedules',
        backHref: '/dashboard/schedules',
        titleField: 'name',
        pills: [
          {
            field: 'status',
            colors: {
              not_started: 'bg-gray-100 text-gray-700',
              in_progress: 'bg-blue-100 text-blue-700',
              on_hold: 'bg-amber-100 text-amber-700',
              completed: 'bg-green-100 text-green-700',
              cancelled: 'bg-red-100 text-red-700',
            },
          },
        ],
        fields: [
          { key: 'name', label: 'Name', type: 'text', required: true },
          { key: 'description', label: 'Description', type: 'textarea' },
          { key: 'startDate', label: 'Start date', type: 'date', required: true, serverKey: 'start_date' },
          { key: 'endDate', label: 'End date', type: 'date', serverKey: 'end_date' },
          { key: 'durationDays', label: 'Duration (days)', type: 'number', serverKey: 'duration_days' },
          { key: 'progressPercent', label: 'Progress (%)', type: 'number', serverKey: 'progress_percent' },
          {
            key: 'status',
            label: 'Status',
            type: 'select',
            options: ['not_started', 'in_progress', 'on_hold', 'completed', 'cancelled']
              .map((v) => ({ value: v, label: v.replace(/_/g, ' ') })),
          },
          { key: 'wbsCode', label: 'WBS code', type: 'text', serverKey: 'wbs_code' },
          { key: 'assignedName', label: 'Assigned to', type: 'text', serverKey: 'assigned_name' },
          { key: 'costEstimate', label: 'Cost estimate', type: 'number', serverKey: 'cost_estimate' },
          { key: 'actualCost', label: 'Actual cost', type: 'number', serverKey: 'actual_cost' },
        ],
        longTextFields: [{ key: 'description', label: 'Description' }],
        metaFields: [
          { label: 'Project', render: (r) => r.project_name || '—' },
          { label: 'Window', render: (r) => `${r.start_date || '?'} → ${r.end_date || '?'}` },
          { label: 'Duration', render: (r) => r.duration_days != null ? `${r.duration_days} days` : '—' },
          { label: 'Progress', render: (r) => r.progress_percent != null ? `${r.progress_percent}%` : '—' },
          { label: 'Assignee', render: (r) => r.assigned_name || '—' },
          { label: 'Cost est', render: (r) => r.cost_estimate != null ? `£${r.cost_estimate}` : '—' },
        ],
      }}
    />
  );
}
