'use client';

import { EntityDetail } from '@/components/EntityDetail';

export default function DelayNoteDetailPage() {
  return (
    <EntityDetail
      config={{
        entityName: 'Delay note',
        pluralName: 'Delay notes',
        apiPath: '/delay-notes',
        backHref: '/dashboard/delay-notes',
        pills: [
          { field: 'category', colors: {} },
          { field: 'impact', colors: {
            low: 'bg-gray-100 text-gray-700',
            medium: 'bg-amber-100 text-amber-700',
            high: 'bg-orange-100 text-orange-700',
            critical: 'bg-red-100 text-red-700',
          } },
        ],
        fields: [
          { key: 'title', label: 'Title', type: 'text', required: true },
          { key: 'description', label: 'Description', type: 'textarea' },
          { key: 'category', label: 'Category', type: 'text' },
          { key: 'impact', label: 'Impact', type: 'select',
            options: ['low', 'medium', 'high', 'critical'].map((v) => ({ value: v, label: v })) },
          { key: 'delayDays', label: 'Delay days', type: 'number', serverKey: 'delay_days' },
          { key: 'startDate', label: 'Start date', type: 'date', serverKey: 'start_date' },
          { key: 'endDate', label: 'End date', type: 'date', serverKey: 'end_date' },
          { key: 'mitigationPlan', label: 'Mitigation plan', type: 'textarea', serverKey: 'mitigation_plan' },
        ],
        longTextFields: [
          { key: 'description', label: 'Description' },
          { key: 'mitigation_plan', label: 'Mitigation plan' },
        ],
        metaFields: [
          { label: 'Project', render: (r) => r.project_name || '—' },
          { label: 'Category', render: (r) => r.category || '—' },
          { label: 'Delay days', render: (r) => r.delay_days ?? '—' },
          { label: 'Window', render: (r) => `${r.start_date || '?'} → ${r.end_date || '?'}` },
        ],
      }}
    />
  );
}
