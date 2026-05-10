'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Plus, PoundSterling, TrendingUp, TrendingDown, BarChart3, Wallet } from 'lucide-react';

interface BudgetSummary {
  projectId: string;
  totalBudget: number;
  totalWithContingency: number;
  actual: number;
  forecast: number;
  commitment: number;
  variance: number;
}

interface CostEntry {
  id: string;
  project_name: string;
  category_name: string;
  entry_type: string;
  description: string;
  amount: number;
  quantity: number;
  unit: string;
  vendor: string;
  cost_code: string;
  date: string;
  notes: string;
  created_at: string;
}

const typeColors: Record<string, string> = {
  budget: 'bg-purple-100 text-purple-700',
  actual: 'bg-blue-100 text-blue-700',
  forecast: 'bg-amber-100 text-amber-700',
  commitment: 'bg-indigo-100 text-indigo-700',
  variance: 'bg-red-100 text-red-700',
};

export default function BudgetPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const { data: entriesData, isLoading } = useQuery({
    queryKey: ['cost-entries', search, typeFilter],
    queryFn: async () => {
      const res = await api.get('/budget/costs', {
        params: { search, entryType: typeFilter || undefined },
      });
      return res.data;
    },
  });

  const entries = entriesData?.data || [];

  const totals = entries.reduce((acc: Record<string, number>, e: CostEntry) => {
    acc[e.entry_type] = (acc[e.entry_type] || 0) + (e.amount || 0);
    return acc;
  }, {});

  const totalActual = totals.actual || 0;
  const totalBudget = totals.budget || 0;
  const totalForecast = totals.forecast || 0;
  const totalCommitment = totals.commitment || 0;
  const variance = totalBudget - totalActual;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Budget & Costs</h1>
        <Link href="/dashboard/budget/create">
          <Button><Plus className="mr-2 h-4 w-4" /> New Cost Entry</Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2"><PoundSterling className="h-5 w-5 text-purple-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Total Budget</p>
                <p className="text-xl font-bold text-gray-900">£{totalBudget.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2"><Wallet className="h-5 w-5 text-blue-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Actual Spend</p>
                <p className="text-xl font-bold text-gray-900">£{totalActual.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 p-2"><BarChart3 className="h-5 w-5 text-amber-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Forecast</p>
                <p className="text-xl font-bold text-gray-900">£{totalForecast.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${variance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                {variance >= 0 ? <TrendingUp className="h-5 w-5 text-green-600" /> : <TrendingDown className="h-5 w-5 text-red-600" />}
              </div>
              <div>
                <p className="text-sm text-gray-500">Variance</p>
                <p className={`text-xl font-bold ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {variance >= 0 ? '+' : ''}£{variance.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search cost entries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:w-40"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="budget">Budget</option>
              <option value="actual">Actual</option>
              <option value="forecast">Forecast</option>
              <option value="commitment">Commitment</option>
              <option value="variance">Variance</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Entries List */}
      {isLoading ? (
        <div className="py-12 text-center text-gray-500">Loading cost entries...</div>
      ) : entries.length === 0 ? (
        <div className="py-12 text-center text-gray-400">
          <PoundSterling className="mx-auto mb-3 h-12 w-12 opacity-40" />
          <p className="text-lg font-medium">No cost entries yet</p>
          <p className="text-sm">Add your first cost entry to track budget vs actual.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((e: CostEntry) => (
            <Card key={e.id} className="transition hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColors[e.entry_type] || 'bg-gray-100 text-gray-700'}`}>
                        {e.entry_type}
                      </span>
                      {e.cost_code && <span className="text-xs text-gray-400">{e.cost_code}</span>}
                    </div>
                    <h3 className="mt-1 text-lg font-semibold text-gray-900 truncate">{e.description || 'Untitled'}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                      <span>£{e.amount?.toLocaleString()}</span>
                      {e.quantity > 0 && <span>{e.quantity} {e.unit}</span>}
                      {e.vendor && <span>{e.vendor}</span>}
                      {e.category_name && <span className="text-blue-600">{e.category_name}</span>}
                      {e.date && <span>{new Date(e.date).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">£{e.amount?.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
