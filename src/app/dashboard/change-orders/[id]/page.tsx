'use client';

import { EntityDetail } from '@/components/EntityDetail';

export default function ChangeOrderDetailPage() {
  return (
    <EntityDetail
      config={{
        entityName: 'Change order',
        pluralName: 'Change orders',
        apiPath: '/change-orders',
        backHref: '/dashboard/change-orders',
        titleField: 'co_number',
        pills: [
          {
            field: 'type',
            colors: {
              scope: 'bg-blue-100 text-blue-700',
              price: 'bg-amber-100 text-amber-700',
              time: 'bg-purple-100 text-purple-700',
              design: 'bg-indigo-100 text-indigo-700',
              other: 'bg-gray-100 text-gray-700',
            },
          },
          {
            field: 'status',
            colors: {
              draft: 'bg-gray-100 text-gray-700',
              submitted: 'bg-blue-100 text-blue-700',
              under_review: 'bg-amber-100 text-amber-700',
              approved: 'bg-green-100 text-green-700',
              rejected: 'bg-red-100 text-red-700',
              withdrawn: 'bg-gray-100 text-gray-700',
            },
          },
        ],
        fields: [
          { key: 'coNumber', label: 'CO #', type: 'text', required: true, serverKey: 'co_number' },
          { key: 'title', label: 'Title', type: 'text', required: true },
          { key: 'description', label: 'Description', type: 'textarea' },
          { key: 'reason', label: 'Reason', type: 'textarea' },
          {
            key: 'type',
            label: 'Type',
            type: 'select',
            options: ['scope', 'price', 'time', 'design', 'other'].map((v) => ({ value: v, label: v })),
          },
          {
            key: 'status',
            label: 'Status',
            type: 'select',
            options: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'withdrawn']
              .map((v) => ({ value: v, label: v.replace(/_/g, ' ') })),
          },
          { key: 'originalCost', label: 'Original cost', type: 'number', serverKey: 'original_cost' },
          { key: 'proposedCost', label: 'Proposed cost', type: 'number', serverKey: 'proposed_cost' },
          { key: 'originalScheduleDays', label: 'Original schedule (days)', type: 'number', serverKey: 'original_schedule_days' },
          { key: 'proposedScheduleDays', label: 'Proposed schedule (days)', type: 'number', serverKey: 'proposed_schedule_days' },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ],
        longTextFields: [
          { key: 'description', label: 'Description' },
          { key: 'reason', label: 'Reason' },
          { key: 'notes', label: 'Notes' },
        ],
        metaFields: [
          { label: 'Project', render: (r) => r.project_name || '—' },
          { label: 'CO #', render: (r) => r.co_number || '—' },
          { label: 'Original cost', render: (r) => r.original_cost != null ? `£${r.original_cost}` : '—' },
          { label: 'Proposed cost', render: (r) => r.proposed_cost != null ? `£${r.proposed_cost}` : '—' },
          { label: 'Original schedule', render: (r) => r.original_schedule_days != null ? `${r.original_schedule_days} days` : '—' },
          { label: 'Proposed schedule', render: (r) => r.proposed_schedule_days != null ? `${r.proposed_schedule_days} days` : '—' },
        ],
      }}
    />
  );
}
