'use client';

import { EntityDetail } from '@/components/EntityDetail';

export default function PermitDetailPage() {
  return (
    <EntityDetail
      config={{
        entityName: 'Permit',
        pluralName: 'Permits',
        apiPath: '/permits',
        backHref: '/dashboard/permits',
        pills: [
          {
            field: 'type',
            colors: {
              hot_work: 'bg-red-100 text-red-700',
              confined_space: 'bg-amber-100 text-amber-700',
              excavation: 'bg-orange-100 text-orange-700',
              working_at_height: 'bg-purple-100 text-purple-700',
              electrical: 'bg-yellow-100 text-yellow-700',
              general: 'bg-gray-100 text-gray-700',
            },
          },
          {
            field: 'status',
            colors: {
              draft: 'bg-gray-100 text-gray-700',
              pending: 'bg-blue-100 text-blue-700',
              active: 'bg-green-100 text-green-700',
              expired: 'bg-red-100 text-red-700',
              cancelled: 'bg-gray-100 text-gray-700',
            },
          },
        ],
        fields: [
          { key: 'title', label: 'Title', type: 'text', required: true },
          {
            key: 'type',
            label: 'Type',
            type: 'select',
            required: true,
            options: ['hot_work', 'confined_space', 'excavation', 'working_at_height', 'electrical', 'general']
              .map((v) => ({ value: v, label: v.replace(/_/g, ' ') })),
          },
          {
            key: 'status',
            label: 'Status',
            type: 'select',
            options: ['draft', 'pending', 'active', 'expired', 'cancelled']
              .map((v) => ({ value: v, label: v })),
          },
          { key: 'location', label: 'Location', type: 'text' },
          { key: 'issuedBy', label: 'Issued by', type: 'text', serverKey: 'issued_by' },
          { key: 'issuedTo', label: 'Issued to', type: 'text', serverKey: 'issued_to' },
          {
            key: 'riskLevel',
            label: 'Risk level',
            type: 'select',
            options: ['low', 'medium', 'high', 'critical'].map((v) => ({ value: v, label: v })),
            serverKey: 'risk_level',
          },
          { key: 'conditions', label: 'Conditions', type: 'textarea' },
        ],
        longTextFields: [{ key: 'conditions', label: 'Conditions' }],
        metaFields: [
          { label: 'Project', render: (r) => r.project_name || '—' },
          { label: 'Location', render: (r) => r.location || '—' },
          { label: 'Issued by', render: (r) => r.issued_by || '—' },
          { label: 'Issued to', render: (r) => r.issued_to || '—' },
          { label: 'Valid from', render: (r) => r.valid_from || '—' },
          { label: 'Valid to', render: (r) => r.valid_to || '—' },
        ],
      }}
    />
  );
}
