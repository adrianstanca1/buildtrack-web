'use client';

import { EntityDetail } from '@/components/EntityDetail';

export default function MeetingDetailPage() {
  return (
    <EntityDetail
      config={{
        entityName: 'Meeting',
        pluralName: 'Meetings',
        apiPath: '/meetings',
        backHref: '/dashboard/meetings',
        fields: [
          { key: 'title', label: 'Title', type: 'text', required: true },
          { key: 'location', label: 'Location', type: 'text' },
          { key: 'meetingDate', label: 'Meeting date', type: 'date', serverKey: 'meeting_date' },
          { key: 'agenda', label: 'Agenda', type: 'textarea' },
          { key: 'minutes', label: 'Minutes', type: 'textarea' },
          { key: 'attendees', label: 'Attendees', type: 'textarea' },
          { key: 'actionItems', label: 'Action items', type: 'textarea', serverKey: 'action_items' },
        ],
        longTextFields: [
          { key: 'agenda', label: 'Agenda' },
          { key: 'minutes', label: 'Minutes' },
          { key: 'attendees', label: 'Attendees' },
          { key: 'action_items', label: 'Action items' },
        ],
        metaFields: [
          { label: 'Project', render: (r) => r.project_name || '—' },
          { label: 'Date', render: (r) => r.meeting_date || '—' },
          { label: 'Location', render: (r) => r.location || '—' },
        ],
      }}
    />
  );
}
