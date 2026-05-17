'use client';

import { EntityDetail } from '@/components/EntityDetail';

export default function MaterialDetailPage() {
  return (
    <EntityDetail
      config={{
        entityName: 'Material',
        pluralName: 'Materials',
        apiPath: '/materials',
        backHref: '/dashboard/materials',
        titleField: 'name',
        fields: [
          { key: 'name', label: 'Name', type: 'text', required: true },
          { key: 'category', label: 'Category', type: 'text' },
          { key: 'quantity', label: 'Quantity', type: 'number' },
          { key: 'unit', label: 'Unit', type: 'text' },
          { key: 'unitCost', label: 'Unit cost', type: 'number', serverKey: 'unit_cost' },
          { key: 'supplier', label: 'Supplier', type: 'text' },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ],
        longTextFields: [{ key: 'notes', label: 'Notes' }],
        metaFields: [
          { label: 'Project', render: (r) => r.project_name || '—' },
          { label: 'Quantity', render: (r) => r.quantity != null ? `${r.quantity} ${r.unit || ''}`.trim() : '—' },
          { label: 'Unit cost', render: (r) => r.unit_cost != null ? `£${r.unit_cost}` : '—' },
          { label: 'Supplier', render: (r) => r.supplier || '—' },
        ],
      }}
    />
  );
}
