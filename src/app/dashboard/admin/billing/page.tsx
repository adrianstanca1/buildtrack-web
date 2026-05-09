'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { CreditCard, Receipt, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface BillingSummary {
  total_revenue: number;
  total_invoices: number;
  paid_invoices: number;
  pending_invoices: number;
  overdue_invoices: number;
}

interface Invoice {
  id: string;
  number: string;
  client: string;
  amount: number;
  status: string;
  due_date: string;
}

export default function AdminBillingPage() {
  const { data: summaryData } = useQuery({
    queryKey: ['billing-summary'],
    queryFn: async () => {
      const res = await api.get('/admin/billing/summary');
      return res.data.data;
    },
  });

  const { data: invoicesData } = useQuery({
    queryKey: ['billing-invoices'],
    queryFn: async () => {
      const res = await api.get('/admin/billing/invoices');
      return res.data.data;
    },
  });

  const summary: BillingSummary = summaryData || {};
  const invoices: Invoice[] = invoicesData || [];

  const statusColors: Record<string, string> = {
    paid: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    overdue: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Billing</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="mt-1 text-xl font-bold">{formatCurrency(summary.total_revenue || 0)}</p>
            </div>
            <div className="rounded-lg bg-green-50 p-3">
              <ArrowUpRight className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-gray-500">Invoices</p>
              <p className="mt-1 text-xl font-bold">{summary.total_invoices || 0}</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-3">
              <Receipt className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-gray-500">Paid</p>
              <p className="mt-1 text-xl font-bold">{summary.paid_invoices || 0}</p>
            </div>
            <div className="rounded-lg bg-green-50 p-3">
              <CreditCard className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-gray-500">Overdue</p>
              <p className="mt-1 text-xl font-bold">{summary.overdue_invoices || 0}</p>
            </div>
            <div className="rounded-lg bg-red-50 p-3">
              <ArrowDownRight className="h-5 w-5 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500">Invoice</th>
                <th className="px-4 py-3 font-medium text-gray-500">Client</th>
                <th className="px-4 py-3 font-medium text-gray-500">Amount</th>
                <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No invoices yet.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{inv.number}</td>
                    <td className="px-4 py-3">{inv.client}</td>
                    <td className="px-4 py-3">{formatCurrency(inv.amount)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          statusColors[inv.status] || 'bg-gray-100'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{inv.due_date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
