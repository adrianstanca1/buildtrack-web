'use client';

import { EntityDetail } from '@/components/EntityDetail';

export default function PunchItemDetailPage() {
  return (
    <EntityDetail
      config={{
        entityName: 'Punch item',
        pluralName: 'Punch items',
        apiPath: '/punch-items',
        backHref: '/dashboard/punch-items',
        pills: [
          { field: 'priority', colors: {
            low: 'bg-gray-100 text-gray-700',
            medium: 'bg-blue-100 text-blue-700',
            high: 'bg-amber-100 text-amber-700',
            critical: 'bg-red-100 text-red-700',
          } },
          { field: 'status', colors: {
            open: 'bg-red-100 text-red-700',
            in_progress: 'bg-blue-100 text-blue-700',
            ready_for_review: 'bg-amber-100 text-amber-700',
            verified: 'bg-emerald-100 text-emerald-700',
            closed: 'bg-gray-100 text-gray-700',
          } },
        ],
        fields: [
          { key: 'title', label: 'Title', type: 'text', required: true },
          { key: 'description', label: 'Description', type: 'textarea' },
          { key: 'location', label: 'Location', type: 'text' },
          { key: 'trade', label: 'Trade', type: 'text' },
          { key: 'priority', label: 'Priority', type: 'select',
            options: ['low', 'medium', 'high', 'critical'].map((v) => ({ value: v, label: v })) },
          { key: 'status', label: 'Status', type: 'select',
            options: ['open', 'in_progress', 'ready_for_review', 'verified', 'closed']
              .map((v) => ({ value: v, label: v.replace(/_/g, ' ') })) },
          { key: 'dueDate', label: 'Due date', type: 'date', serverKey: 'due_date' },
        ],
        longTextFields: [{ key: 'description', label: 'Description' }],
        metaFields: [
          { label: 'Project', render: (r) => r.project_name || '—' },
          { label: 'Location', render: (r) => r.location || '—' },
          { label: 'Trade', render: (r) => r.trade || '—' },
          { label: 'Due', render: (r) => r.due_date || '—' },
        ],
      }}
    />
  );
}
