'use client';

import { EntityDetail } from '@/components/EntityDetail';

export default function InspectionDetailPage() {
  return (
    <EntityDetail
      config={{
        entityName: 'Inspection',
        pluralName: 'Inspections',
        apiPath: '/inspections',
        backHref: '/dashboard/inspections',
        pills: [
          { field: 'result', colors: {
            pass: 'bg-green-100 text-green-700',
            fail: 'bg-red-100 text-red-700',
            conditional: 'bg-amber-100 text-amber-700',
          } },
          { field: 'status', colors: {
            scheduled: 'bg-blue-100 text-blue-700',
            completed: 'bg-green-100 text-green-700',
            cancelled: 'bg-gray-100 text-gray-700',
          } },
        ],
        fields: [
          { key: 'title', label: 'Title', type: 'text', required: true },
          { key: 'inspectionType', label: 'Type', type: 'text', serverKey: 'inspection_type' },
          { key: 'inspector', label: 'Inspector', type: 'text' },
          { key: 'inspectionDate', label: 'Inspection date', type: 'date', serverKey: 'inspection_date' },
          { key: 'status', label: 'Status', type: 'select',
            options: ['scheduled', 'completed', 'cancelled'].map((v) => ({ value: v, label: v })) },
          { key: 'result', label: 'Result', type: 'select',
            options: ['pass', 'fail', 'conditional'].map((v) => ({ value: v, label: v })) },
          { key: 'findings', label: 'Findings', type: 'textarea' },
          { key: 'recommendations', label: 'Recommendations', type: 'textarea' },
        ],
        longTextFields: [
          { key: 'findings', label: 'Findings' },
          { key: 'recommendations', label: 'Recommendations' },
        ],
        metaFields: [
          { label: 'Project', render: (r) => r.project_name || '—' },
          { label: 'Type', render: (r) => r.inspection_type || '—' },
          { label: 'Inspector', render: (r) => r.inspector || '—' },
          { label: 'Date', render: (r) => r.inspection_date || '—' },
        ],
      }}
    />
  );
}
