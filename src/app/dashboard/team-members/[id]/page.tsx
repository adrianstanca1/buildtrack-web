'use client';

import { EntityDetail } from '@/components/EntityDetail';

export default function TeamMemberDetailPage() {
  return (
    <EntityDetail
      config={{
        entityName: 'Team member',
        pluralName: 'Team',
        apiPath: '/team-members',
        backHref: '/dashboard/team-members',
        titleField: 'name',
        pills: [
          { field: 'role', colors: {} },
          { field: 'status', colors: {
            active: 'bg-green-100 text-green-700',
            inactive: 'bg-gray-100 text-gray-700',
            on_leave: 'bg-amber-100 text-amber-700',
          } },
        ],
        fields: [
          { key: 'name', label: 'Name', type: 'text', required: true },
          { key: 'email', label: 'Email', type: 'text' },
          { key: 'phone', label: 'Phone', type: 'text' },
          { key: 'role', label: 'Role', type: 'text' },
          { key: 'department', label: 'Department', type: 'text' },
          { key: 'status', label: 'Status', type: 'select',
            options: ['active', 'inactive', 'on_leave'].map((v) => ({ value: v, label: v.replace(/_/g, ' ') })) },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ],
        longTextFields: [{ key: 'notes', label: 'Notes' }],
        metaFields: [
          { label: 'Email', render: (r) => r.email || '—' },
          { label: 'Phone', render: (r) => r.phone || '—' },
          { label: 'Role', render: (r) => r.role || '—' },
          { label: 'Department', render: (r) => r.department || '—' },
        ],
      }}
    />
  );
}
