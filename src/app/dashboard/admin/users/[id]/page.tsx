'use client';

import { EntityDetail } from '@/components/EntityDetail';

// Admin-only user detail. Edit lets ops set role + subscription
// tier/status. Bound to /api/admin/users/:id (PUT + DELETE; GET comes
// from the list endpoint, but EntityDetail still uses GET /:id — see
// note below).
//
// NB: /api/admin/users (list) exists; /api/admin/users/:id (GET single)
// is not in src/routes/admin.ts as of 0bd4df0. If the load 404s, fall
// back to opening the row from the list view. PUT and DELETE are wired.

export default function AdminUserDetailPage() {
  return (
    <EntityDetail
      config={{
        entityName: 'User',
        pluralName: 'Users',
        apiPath: '/admin/users',
        backHref: '/dashboard/admin/users',
        titleField: 'email',
        pills: [
          { field: 'role', colors: {
            user: 'bg-gray-100 text-gray-700',
            admin: 'bg-red-100 text-red-700',
            super_admin: 'bg-purple-100 text-purple-700',
          } },
          { field: 'subscription_tier', colors: {
            free: 'bg-gray-100 text-gray-700',
            pro: 'bg-blue-100 text-blue-700',
            enterprise: 'bg-emerald-100 text-emerald-700',
          } },
          { field: 'subscription_status', colors: {
            active: 'bg-green-100 text-green-700',
            inactive: 'bg-gray-100 text-gray-700',
            past_due: 'bg-amber-100 text-amber-700',
            cancelled: 'bg-red-100 text-red-700',
            trialing: 'bg-purple-100 text-purple-700',
          } },
        ],
        fields: [
          { key: 'role', label: 'Role', type: 'select',
            options: ['user', 'admin', 'super_admin'].map((v) => ({ value: v, label: v.replace(/_/g, ' ') })) },
          { key: 'subscriptionTier', label: 'Subscription tier', type: 'select',
            serverKey: 'subscription_tier',
            options: ['free', 'pro', 'enterprise'].map((v) => ({ value: v, label: v })) },
          { key: 'subscriptionStatus', label: 'Subscription status', type: 'select',
            serverKey: 'subscription_status',
            options: ['active', 'inactive', 'past_due', 'cancelled', 'trialing']
              .map((v) => ({ value: v, label: v.replace(/_/g, ' ') })) },
        ],
        metaFields: [
          { label: 'Email', render: (r) => r.email || '—' },
          { label: 'First name', render: (r) => r.first_name || '—' },
          { label: 'Last name', render: (r) => r.last_name || '—' },
          { label: 'Company', render: (r) => r.company_name || '—' },
          { label: 'Phone', render: (r) => r.phone || '—' },
          { label: 'Subscription', render: (r) => `${r.subscription_tier || '—'} / ${r.subscription_status || '—'}` },
        ],
      }}
    />
  );
}
