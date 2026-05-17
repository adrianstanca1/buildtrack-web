'use client';

import { EntityDetail } from '@/components/EntityDetail';

export default function SitePhotoDetailPage() {
  return (
    <EntityDetail
      config={{
        entityName: 'Site photo',
        pluralName: 'Site photos',
        apiPath: '/site-photos',
        backHref: '/dashboard/site-photos',
        titleField: 'caption',
        fields: [
          { key: 'caption', label: 'Caption', type: 'text' },
          { key: 'photoUrl', label: 'Photo URL', type: 'text', required: true, serverKey: 'photo_url' },
          { key: 'location', label: 'Location', type: 'text' },
        ],
        metaFields: [
          { label: 'Project', render: (r) => r.project_name || '—' },
          { label: 'Location', render: (r) => r.location || '—' },
          { label: 'Photo', render: (r) => r.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={r.photo_url} alt={r.caption || 'site photo'} className="mt-2 max-w-xs rounded-lg" />
          ) : '—' },
        ],
      }}
    />
  );
}
