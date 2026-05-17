'use client';

import { EntityDetail } from '@/components/EntityDetail';

export default function SubmittalDetailPage() {
  return (
    <EntityDetail
      config={{
        entityName: 'Submittal',
        pluralName: 'Submittals',
        apiPath: '/submittals',
        backHref: '/dashboard/submittals',
        pills: [
          {
            field: 'type',
            colors: {
              shop_drawing: 'bg-blue-100 text-blue-700',
              product_data: 'bg-purple-100 text-purple-700',
              sample: 'bg-amber-100 text-amber-700',
              mockup: 'bg-orange-100 text-orange-700',
              closeout: 'bg-gray-100 text-gray-700',
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
              approved_as_noted: 'bg-emerald-100 text-emerald-700',
              rejected: 'bg-red-100 text-red-700',
              resubmit: 'bg-orange-100 text-orange-700',
              closed: 'bg-gray-100 text-gray-700',
            },
          },
        ],
        fields: [
          { key: 'title', label: 'Title', type: 'text', required: true },
          { key: 'submittalNumber', label: 'Submittal #', type: 'text', required: true, serverKey: 'submittal_number' },
          { key: 'description', label: 'Description', type: 'textarea' },
          {
            key: 'type',
            label: 'Type',
            type: 'select',
            options: ['shop_drawing', 'product_data', 'sample', 'mockup', 'closeout', 'other']
              .map((v) => ({ value: v, label: v.replace(/_/g, ' ') })),
          },
          {
            key: 'status',
            label: 'Status',
            type: 'select',
            options: ['draft', 'submitted', 'under_review', 'approved', 'approved_as_noted', 'rejected', 'resubmit', 'closed']
              .map((v) => ({ value: v, label: v.replace(/_/g, ' ') })),
          },
          { key: 'specSection', label: 'Spec section', type: 'text', serverKey: 'spec_section' },
          { key: 'responsibleCompany', label: 'Responsible company', type: 'text', serverKey: 'responsible_company' },
          { key: 'dueDate', label: 'Due date', type: 'date', serverKey: 'due_date' },
        ],
        longTextFields: [{ key: 'description', label: 'Description' }],
        metaFields: [
          { label: 'Project', render: (r) => r.project_name || '—' },
          { label: 'Submittal #', render: (r) => r.submittal_number || '—' },
          { label: 'Spec section', render: (r) => r.spec_section || '—' },
          { label: 'Responsible', render: (r) => r.responsible_company || '—' },
          { label: 'Due', render: (r) => r.due_date || '—' },
        ],
      }}
    />
  );
}
