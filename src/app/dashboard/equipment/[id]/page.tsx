'use client';

import { EntityDetail } from '@/components/EntityDetail';

export default function EquipmentDetailPage() {
  return (
    <EntityDetail
      config={{
        entityName: 'Equipment',
        pluralName: 'Equipment',
        apiPath: '/equipment',
        backHref: '/dashboard/equipment',
        titleField: 'name',
        pills: [
          { field: 'type', colors: {} },
          {
            field: 'status',
            colors: {
              available: 'bg-green-100 text-green-700',
              rented: 'bg-blue-100 text-blue-700',
              on_site: 'bg-amber-100 text-amber-700',
              under_maintenance: 'bg-purple-100 text-purple-700',
              out_of_service: 'bg-red-100 text-red-700',
              retired: 'bg-gray-100 text-gray-700',
            },
          },
        ],
        fields: [
          { key: 'name', label: 'Name', type: 'text', required: true },
          {
            key: 'type',
            label: 'Type',
            type: 'select',
            options: [
              'excavator', 'bulldozer', 'crane', 'loader', 'dump_truck',
              'mixer', 'generator', 'scaffold', 'scissor_lift', 'forklift',
              'compactor', 'other',
            ].map((v) => ({ value: v, label: v.replace(/_/g, ' ') })),
          },
          { key: 'make', label: 'Make', type: 'text' },
          { key: 'model', label: 'Model', type: 'text' },
          { key: 'serialNumber', label: 'Serial number', type: 'text', serverKey: 'serial_number' },
          { key: 'year', label: 'Year', type: 'number' },
          {
            key: 'status',
            label: 'Status',
            type: 'select',
            options: ['available', 'rented', 'on_site', 'under_maintenance', 'out_of_service', 'retired']
              .map((v) => ({ value: v, label: v.replace(/_/g, ' ') })),
          },
          { key: 'dailyRate', label: 'Daily rate', type: 'number', serverKey: 'daily_rate' },
          { key: 'location', label: 'Location', type: 'text' },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ],
        longTextFields: [{ key: 'notes', label: 'Notes' }],
        metaFields: [
          { label: 'Make', render: (r) => r.make || '—' },
          { label: 'Model', render: (r) => r.model || '—' },
          { label: 'Serial', render: (r) => r.serial_number || '—' },
          { label: 'Year', render: (r) => r.year || '—' },
          { label: 'Daily rate', render: (r) => r.daily_rate ? `£${r.daily_rate}` : '—' },
          { label: 'Location', render: (r) => r.location || '—' },
        ],
      }}
    />
  );
}
