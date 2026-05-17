'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Plus, FileText, DollarSign, Truck, Clock } from 'lucide-react';

interface PurchaseOrder {
  id: string;
  project_name: string;
  po_number: string;
  title: string;
  vendor_name: string;
  status: string;
  total: number;
  delivery_date: string;
  expected_delivery: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  acknowledged: 'bg-indigo-100 text-indigo-700',
  partially_delivered: 'bg-amber-100 text-amber-700',
  delivered: 'bg-green-100 text-green-700',
  invoiced: 'bg-purple-100 text-purple-700',
  paid: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function PurchaseOrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['purchase-orders', search, statusFilter],
    queryFn: async () => {
      const res = await api.get('/purchase-orders', {
        params: { search, status: statusFilter || undefined },
      });
      return res.data;
    },
  });

  const orders = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
        <Link href="/dashboard/purchase-orders/create">
          <Button><Plus className="mr-2 h-4 w-4" /> New PO</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search POs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:w-48"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="partially_delivered">Partially Delivered</option>
              <option value="delivered">Delivered</option>
              <option value="invoiced">Invoiced</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="py-12 text-center text-gray-500">Loading purchase orders...</div>
      ) : orders.length === 0 ? (
        <div className="py-12 text-center text-gray-400">
          <FileText className="mx-auto mb-3 h-12 w-12 opacity-40" />
          <p className="text-lg font-medium">No purchase orders yet</p>
          <p className="text-sm">Create your first PO to track vendor orders.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((po: PurchaseOrder) => (
            <Link key={po.id} href={`/dashboard/purchase-orders/${po.id}`}>
            <Card className="cursor-pointer transition hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[po.status] || statusColors.draft}`}>
                        {po.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-mono text-gray-500">{po.po_number}</span>
                    </div>
                    <h3 className="mt-1 text-lg font-semibold text-gray-900 truncate">{po.title}</h3>
                    <p className="text-sm text-gray-500">{po.vendor_name} • {po.project_name}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                      {po.total > 0 && (
                        <span className="flex items-center gap-1 font-medium text-gray-700">
                          <DollarSign className="h-3.5 w-3.5" />
                          £{po.total?.toLocaleString?.() ?? po.total}
                        </span>
                      )}
                      {po.delivery_date && (
                        <span className="flex items-center gap-1">
                          <Truck className="h-3.5 w-3.5" />
                          Due: {new Date(po.delivery_date).toLocaleDateString()}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(po.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
