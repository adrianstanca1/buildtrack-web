'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Plus, Image, FileImage } from 'lucide-react';

interface Drawing {
  id: string;
  project_name: string;
  title: string;
  description: string;
  file_url: string;
  version: string;
  status: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  superseded: 'bg-amber-100 text-amber-700',
  archived: 'bg-gray-100 text-gray-700',
};

export default function DrawingsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['drawings', search, statusFilter],
    queryFn: async () => {
      const res = await api.get('/drawings', {
        params: { search, status: statusFilter || undefined },
      });
      return res.data;
    },
  });

  const drawings = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Drawings</h1>
        <Link href="/dashboard/drawings/create">
          <Button><Plus className="mr-2 h-4 w-4" /> New Drawing</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search drawings..."
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
                <option value="active">Active</option>
                <option value="superseded">Superseded</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : drawings.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileImage className="h-12 w-12 text-gray-300" />
              <p className="mt-4 text-gray-500">No drawings found.</p>
            </CardContent>
          </Card>
        ) : (
          drawings.map((drawing: Drawing) => (
            <Card key={drawing.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{drawing.title}</h3>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[drawing.status] || 'bg-gray-100'}`}>
                    {drawing.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">{drawing.project_name}</p>
                {drawing.description && <p className="mt-2 text-sm text-gray-600 line-clamp-2">{drawing.description}</p>}
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                  <span>v{drawing.version || '1.0'}</span>
                  <span>•</span>
                  <a href={drawing.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View File</a>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
