'use client';

import { EntityDetail } from '@/components/EntityDetail';

export default function DrawingDetailPage() {
  return (
    <EntityDetail
      config={{
        entityName: 'Drawing',
        pluralName: 'Drawings',
        apiPath: '/drawings',
        backHref: '/dashboard/drawings',
        pills: [
          {
            field: 'status',
            colors: {
              current: 'bg-green-100 text-green-700',
              superseded: 'bg-amber-100 text-amber-700',
              archived: 'bg-gray-100 text-gray-700',
            },
          },
        ],
        fields: [
          { key: 'title', label: 'Title', type: 'text', required: true },
          { key: 'fileUrl', label: 'File URL', type: 'text', required: true, serverKey: 'file_url' },
          { key: 'version', label: 'Revision', type: 'text', serverKey: 'revision' },
          {
            key: 'status',
            label: 'Status',
            type: 'select',
            options: ['current', 'superseded', 'archived'].map((v) => ({ value: v, label: v })),
          },
          { key: 'description', label: 'Description', type: 'textarea' },
        ],
        longTextFields: [{ key: 'description', label: 'Description' }],
        metaFields: [
          { label: 'Project', render: (r) => r.project_name || '—' },
          { label: 'Drawing #', render: (r) => r.drawing_number || '—' },
          { label: 'Revision', render: (r) => r.revision || '—' },
          { label: 'Discipline', render: (r) => r.discipline || '—' },
          { label: 'Sheet', render: (r) => r.sheet_number || '—' },
          { label: 'File', render: (r) => r.file_url ? (
            // eslint-disable-next-line react/jsx-no-target-blank
            <a href={r.file_url} className="text-blue-600 hover:underline" target="_blank" rel="noopener">Open</a>
          ) : '—' },
        ],
      }}
    />
  );
}
