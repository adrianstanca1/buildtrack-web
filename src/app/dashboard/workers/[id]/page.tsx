'use client';

import { EntityDetail } from '@/components/EntityDetail';

export default function WorkerDetailPage() {
  return (
    <EntityDetail
      config={{
        entityName: 'Worker',
        pluralName: 'Workers',
        apiPath: '/workers',
        backHref: '/dashboard/workers',
        titleField: 'name',
        pills: [
          { field: 'role', colors: {} },
          { field: 'status', colors: {
            active: 'bg-green-100 text-green-700',
            'off-duty': 'bg-amber-100 text-amber-700',
            'on-leave': 'bg-blue-100 text-blue-700',
          } },
        ],
        fields: [
          { key: 'name', label: 'Name', type: 'text', required: true },
          { key: 'role', label: 'Role', type: 'select',
            options: ['foreman', 'electrician', 'plumber', 'carpenter', 'mason', 'laborer', 'engineer', 'safety-officer']
              .map((v) => ({ value: v, label: v })) },
          { key: 'status', label: 'Status', type: 'select',
            options: ['active', 'off-duty', 'on-leave'].map((v) => ({ value: v, label: v })) },
          { key: 'phone', label: 'Phone', type: 'text' },
          { key: 'email', label: 'Email', type: 'text' },
          { key: 'hourlyRate', label: 'Hourly rate', type: 'number', serverKey: 'hourly_rate' },
          { key: 'weeklyHours', label: 'Weekly hours', type: 'number', serverKey: 'weekly_hours' },
        ],
        metaFields: [
          { label: 'Email', render: (r) => r.email || '—' },
          { label: 'Phone', render: (r) => r.phone || '—' },
          { label: 'Hourly rate', render: (r) => r.hourly_rate != null ? `£${r.hourly_rate}` : '—' },
          { label: 'Weekly hrs', render: (r) => r.weekly_hours ?? '—' },
        ],
      }}
    />
  );
}
