'use client';

import { EntityDetail } from '@/components/EntityDetail';

export default function PurchaseOrderDetailPage() {
  return (
    <EntityDetail
      config={{
        entityName: 'Purchase order',
        pluralName: 'Purchase orders',
        apiPath: '/purchase-orders',
        backHref: '/dashboard/purchase-orders',
        titleField: 'po_number',
        pills: [
          { field: 'status', colors: {
            draft: 'bg-gray-100 text-gray-700',
            sent: 'bg-blue-100 text-blue-700',
            acknowledged: 'bg-amber-100 text-amber-700',
            partially_delivered: 'bg-orange-100 text-orange-700',
            delivered: 'bg-green-100 text-green-700',
            invoiced: 'bg-purple-100 text-purple-700',
            paid: 'bg-emerald-100 text-emerald-700',
            cancelled: 'bg-red-100 text-red-700',
          } },
        ],
        fields: [
          { key: 'poNumber', label: 'PO #', type: 'text', required: true, serverKey: 'po_number' },
          { key: 'title', label: 'Title', type: 'text', required: true },
          { key: 'vendorName', label: 'Vendor', type: 'text', required: true, serverKey: 'vendor_name' },
          { key: 'vendorEmail', label: 'Vendor email', type: 'text', serverKey: 'vendor_email' },
          { key: 'vendorPhone', label: 'Vendor phone', type: 'text', serverKey: 'vendor_phone' },
          { key: 'description', label: 'Description', type: 'textarea' },
          { key: 'status', label: 'Status', type: 'select',
            options: ['draft', 'sent', 'acknowledged', 'partially_delivered', 'delivered', 'invoiced', 'paid', 'cancelled']
              .map((v) => ({ value: v, label: v.replace(/_/g, ' ') })) },
          { key: 'subtotal', label: 'Subtotal', type: 'number' },
          { key: 'taxRate', label: 'Tax rate %', type: 'number', serverKey: 'tax_rate' },
          { key: 'total', label: 'Total', type: 'number' },
          { key: 'deliveryDate', label: 'Delivery date', type: 'date', serverKey: 'delivery_date' },
        ],
        longTextFields: [{ key: 'description', label: 'Description' }],
        metaFields: [
          { label: 'Project', render: (r) => r.project_name || '—' },
          { label: 'Vendor', render: (r) => r.vendor_name || '—' },
          { label: 'Total', render: (r) => r.total ? `£${r.total}` : '—' },
          { label: 'Delivery', render: (r) => r.delivery_date || '—' },
        ],
      }}
    />
  );
}
