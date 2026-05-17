'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Plus, Receipt, PoundSterling } from 'lucide-react';

interface Invoice {
  id: string;
  project_name: string;
  invoice_number: string;
  supplier: string;
  total_amount: number;
  status: string;
  due_date: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

export default function InvoicesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', search, statusFilter],
    queryFn: async () => {
      const res = await api.get('/invoices', {
        params: { search, status: statusFilter || undefined },
      });
      return res.data;
    },
  });

  const invoices = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <Link href="/dashboard/invoices/create">
          <Button><Plus className="mr-2 h-4 w-4" /> New Invoice</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search invoices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="sm:w-48">
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : invoices.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Receipt className="h-12 w-12 text-gray-300" />
              <p className="mt-4 text-gray-500">No invoices found.</p>
            </CardContent>
          </Card>
        ) : (
          invoices.map((invoice: Invoice) => (
            <Link key={invoice.id} href={`/dashboard/invoices/${invoice.id}`}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">{invoice.invoice_number}</h3>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[invoice.status] || 'bg-gray-100'}`}>
                        {invoice.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{invoice.project_name}</p>
                    {invoice.supplier && <p className="mt-1 text-sm text-gray-500">{invoice.supplier}</p>}
                    <div className="mt-2 flex items-center gap-2 text-sm font-medium text-gray-900">
                      <PoundSterling className="h-4 w-4" />
                      {(invoice.total_amount || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                    </div>
                    {invoice.due_date && (
                      <p className="mt-1 text-xs text-gray-400">Due: {new Date(invoice.due_date).toLocaleDateString('en-GB')}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
