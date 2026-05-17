'use client';

import { EntityDetail } from '@/components/EntityDetail';

// The safety API namespaces all CRUD under /api/safety/incidents/* — there
// is no top-level /api/safety/:id. We point EntityDetail at the nested path.
export default function SafetyIncidentDetailPage() {
  return (
    <EntityDetail
      config={{
        entityName: 'Safety incident',
        pluralName: 'Safety incidents',
        apiPath: '/safety/incidents',
        backHref: '/dashboard/safety',
        titleField: 'title',
        pills: [
          {
            field: 'severity',
            colors: {
              minor: 'bg-blue-100 text-blue-700',
              moderate: 'bg-amber-100 text-amber-700',
              major: 'bg-orange-100 text-orange-700',
              critical: 'bg-red-100 text-red-700',
              near_miss: 'bg-purple-100 text-purple-700',
            },
          },
          {
            field: 'status',
            colors: {
              open: 'bg-red-100 text-red-700',
              investigating: 'bg-amber-100 text-amber-700',
              resolved: 'bg-green-100 text-green-700',
              closed: 'bg-gray-100 text-gray-700',
            },
          },
        ],
        fields: [
          { key: 'title', label: 'Title', type: 'text', required: true },
          { key: 'description', label: 'Description', type: 'textarea' },
          { key: 'location', label: 'Location', type: 'text' },
          {
            key: 'severity',
            label: 'Severity',
            type: 'select',
            options: ['minor', 'moderate', 'major', 'critical', 'near_miss']
              .map((v) => ({ value: v, label: v.replace(/_/g, ' ') })),
          },
          {
            key: 'status',
            label: 'Status',
            type: 'select',
            options: ['open', 'investigating', 'resolved', 'closed']
              .map((v) => ({ value: v, label: v })),
          },
          { key: 'incidentDate', label: 'Incident date', type: 'date', serverKey: 'incident_date' },
          { key: 'rootCause', label: 'Root cause', type: 'textarea', serverKey: 'root_cause' },
          { key: 'correctiveAction', label: 'Corrective action', type: 'textarea', serverKey: 'corrective_action' },
        ],
        longTextFields: [
          { key: 'description', label: 'Description' },
          { key: 'root_cause', label: 'Root cause' },
          { key: 'corrective_action', label: 'Corrective action' },
        ],
        metaFields: [
          { label: 'Project', render: (r) => r.project_name || '—' },
          { label: 'Location', render: (r) => r.location || '—' },
          { label: 'Incident date', render: (r) => r.incident_date || '—' },
          { label: 'Reported by', render: (r) => r.reported_by_name || r.reported_by || '—' },
        ],
      }}
    />
  );
}
