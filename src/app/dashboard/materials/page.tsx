'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Plus, Package, AlertTriangle, TrendingDown, MapPin } from 'lucide-react';

interface Material {
  id: string;
  project_name: string;
  name: string;
  category: string;
  unit: string;
  unit_cost: number;
  quantity_on_hand: number;
  quantity_ordered: number;
  reorder_level: number;
  reorder_quantity: number;
  supplier_name: string;
  location: string;
  created_at: string;
}

const categoryColors: Record<string, string> = {
  concrete: 'bg-stone-100 text-stone-700',
  steel: 'bg-slate-100 text-slate-700',
  timber: 'bg-amber-100 text-amber-700',
  brick: 'bg-orange-100 text-orange-700',
  block: 'bg-gray-100 text-gray-700',
  insulation: 'bg-cyan-100 text-cyan-700',
  roofing: 'bg-red-100 text-red-700',
  electrical: 'bg-yellow-100 text-yellow-700',
  plumbing: 'bg-blue-100 text-blue-700',
  paint: 'bg-pink-100 text-pink-700',
  hardware: 'bg-emerald-100 text-emerald-700',
  aggregate: 'bg-stone-100 text-stone-600',
  other: 'bg-gray-100 text-gray-500',
};

export default function MaterialsPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['materials', search, categoryFilter, lowStockOnly],
    queryFn: async () => {
      const res = await api.get('/materials', {
        params: { search, category: categoryFilter || undefined, lowStock: lowStockOnly || undefined },
      });
      return res.data;
    },
  });

  const materials = data?.data || [];

  const isLowStock = (m: Material) => m.reorder_level > 0 && m.quantity_on_hand <= m.reorder_level;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Materials</h1>
        <Link href="/dashboard/materials/create">
          <Button><Plus className="mr-2 h-4 w-4" /> New Material</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search materials..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:w-44"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {Object.keys(categoryColors).map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={lowStockOnly}
                onChange={(e) => setLowStockOnly(e.target.checked)}
                className="rounded border-gray-300"
              />
              Low Stock
            </label>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="py-12 text-center text-gray-500">Loading materials...</div>
      ) : materials.length === 0 ? (
        <div className="py-12 text-center text-gray-400">
          <Package className="mx-auto mb-3 h-12 w-12 opacity-40" />
          <p className="text-lg font-medium">No materials yet</p>
          <p className="text-sm">Add your first material to track inventory.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {materials.map((m: Material) => (
            <Link key={m.id} href={`/dashboard/materials/${m.id}`}>
            <Card className={`cursor-pointer transition hover:shadow-md ${isLowStock(m) ? 'border-red-200' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColors[m.category] || categoryColors.other}`}>
                        {m.category}
                      </span>
                      {isLowStock(m) && (
                        <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> Low Stock
                        </span>
                      )}
                    </div>
                    <h3 className="mt-1 text-lg font-semibold text-gray-900 truncate">{m.name}</h3>
                    <p className="text-sm text-gray-500">{m.project_name || 'Unassigned'}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                      <span>{m.quantity_on_hand?.toLocaleString()} {m.unit} on hand</span>
                      {m.quantity_ordered > 0 && <span className="text-blue-600">{m.quantity_ordered?.toLocaleString()} ordered</span>}
                      {m.unit_cost > 0 && <span>£{m.unit_cost}/{m.unit}</span>}
                      {m.reorder_level > 0 && (
                        <span className={`flex items-center gap-1 ${isLowStock(m) ? 'text-red-600' : 'text-gray-500'}`}>
                          <TrendingDown className="h-3.5 w-3.5" />
                          Reorder at {m.reorder_level}
                        </span>
                      )}
                      {m.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> {m.location}
                        </span>
                      )}
                    </div>
                    {m.supplier_name && <p className="mt-1 text-xs text-gray-400">Supplier: {m.supplier_name}</p>}
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
