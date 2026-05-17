'use client';

import { EntityDetail } from '@/components/EntityDetail';

export default function InvoiceDetailPage() {
  return (
    <EntityDetail
      config={{
        entityName: 'Invoice',
        pluralName: 'Invoices',
        apiPath: '/invoices',
        backHref: '/dashboard/invoices',
        titleField: 'invoice_number',
        pills: [
          {
            field: 'status',
            colors: {
              draft: 'bg-gray-100 text-gray-700',
              sent: 'bg-blue-100 text-blue-700',
              approved: 'bg-emerald-100 text-emerald-700',
              paid: 'bg-green-100 text-green-700',
              overdue: 'bg-red-100 text-red-700',
              cancelled: 'bg-gray-100 text-gray-700',
            },
          },
        ],
        fields: [
          { key: 'invoiceNumber', label: 'Invoice #', type: 'text', required: true, serverKey: 'invoice_number' },
          { key: 'supplier', label: 'Supplier', type: 'text' },
          { key: 'amount', label: 'Amount', type: 'number' },
          { key: 'vatAmount', label: 'VAT amount', type: 'number', serverKey: 'vat_amount' },
          {
            key: 'status',
            label: 'Status',
            type: 'select',
            options: ['draft', 'sent', 'approved', 'paid', 'overdue', 'cancelled']
              .map((v) => ({ value: v, label: v })),
          },
          { key: 'dueDate', label: 'Due date', type: 'date', serverKey: 'due_date' },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ],
        longTextFields: [{ key: 'notes', label: 'Notes' }],
        metaFields: [
          { label: 'Project', render: (r) => r.project_name || '—' },
          { label: 'Supplier', render: (r) => r.supplier || r.client_name || '—' },
          { label: 'Subtotal', render: (r) => r.subtotal ? `£${r.subtotal}` : '—' },
          { label: 'Total', render: (r) => r.total ? `£${r.total}` : '—' },
          { label: 'Due', render: (r) => r.due_date || '—' },
        ],
      }}
    />
  );
}
