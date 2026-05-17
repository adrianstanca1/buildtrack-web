'use client';

import { EntityDetail } from '@/components/EntityDetail';

export default function TimesheetDetailPage() {
  return (
    <EntityDetail
      config={{
        entityName: 'Timesheet entry',
        pluralName: 'Timesheets',
        apiPath: '/timesheets',
        backHref: '/dashboard/timesheets',
        titleField: 'entry_date',
        pills: [
          {
            field: 'status',
            colors: {
              submitted: 'bg-blue-100 text-blue-700',
              approved: 'bg-green-100 text-green-700',
              rejected: 'bg-red-100 text-red-700',
              paid: 'bg-emerald-100 text-emerald-700',
            },
          },
          {
            field: 'category',
            colors: {
              regular: 'bg-gray-100 text-gray-700',
              overtime: 'bg-amber-100 text-amber-700',
              weekend: 'bg-purple-100 text-purple-700',
              holiday: 'bg-orange-100 text-orange-700',
              sick: 'bg-red-100 text-red-700',
              leave: 'bg-blue-100 text-blue-700',
            },
          },
        ],
        fields: [
          { key: 'entryDate', label: 'Entry date', type: 'date', required: true, serverKey: 'entry_date' },
          { key: 'hoursWorked', label: 'Hours worked', type: 'number', required: true, serverKey: 'hours_worked' },
          { key: 'overtimeHours', label: 'Overtime hours', type: 'number', serverKey: 'overtime_hours' },
          { key: 'hourlyRate', label: 'Hourly rate', type: 'number', serverKey: 'hourly_rate' },
          { key: 'overtimeRate', label: 'Overtime rate', type: 'number', serverKey: 'overtime_rate' },
          { key: 'workDescription', label: 'Work description', type: 'textarea', serverKey: 'work_description' },
          {
            key: 'category',
            label: 'Category',
            type: 'select',
            options: ['regular', 'overtime', 'weekend', 'holiday', 'sick', 'leave']
              .map((v) => ({ value: v, label: v })),
          },
          {
            key: 'status',
            label: 'Status',
            type: 'select',
            options: ['submitted', 'approved', 'rejected', 'paid'].map((v) => ({ value: v, label: v })),
          },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ],
        longTextFields: [
          { key: 'work_description', label: 'Work description' },
          { key: 'notes', label: 'Notes' },
        ],
        metaFields: [
          { label: 'Project', render: (r) => r.project_name || '—' },
          { label: 'Worker', render: (r) => r.worker_name || '—' },
          { label: 'Date', render: (r) => r.entry_date || '—' },
          { label: 'Hours', render: (r) => r.hours_worked != null ? `${r.hours_worked}h${r.overtime_hours ? ` (+${r.overtime_hours}h OT)` : ''}` : '—' },
          { label: 'Hourly rate', render: (r) => r.hourly_rate ? `£${r.hourly_rate}` : '—' },
        ],
      }}
    />
  );
}
