'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Plus, ImageIcon } from 'lucide-react';

interface SitePhoto {
  id: string;
  caption: string;
  category: string;
  projectName: string;
  takenBy: string;
  takenAt: string;
  url: string;
}

const categoryColors: Record<string, string> = {
  progress: 'bg-blue-100 text-blue-700',
  issue: 'bg-red-100 text-red-700',
  safety: 'bg-amber-100 text-amber-700',
  quality: 'bg-green-100 text-green-700',
  general: 'bg-gray-100 text-gray-700',
};

export default function SitePhotosPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['site-photos', search, categoryFilter],
    queryFn: async () => {
      const res = await api.get('/site-photos', {
        params: { search, category: categoryFilter || undefined },
      });
      return res.data;
    },
  });

  const photos = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Site Photos</h1>
        <Link href="/dashboard/site-photos/upload">
          <Button><Plus className="mr-2 h-4 w-4" /> Upload Photo</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search photos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="progress">Progress</option>
            <option value="issue">Issue</option>
            <option value="safety">Safety</option>
            <option value="quality">Quality</option>
            <option value="general">General</option>
          </select>
        </CardContent>
      </Card>

      {isLoading ? (
        <p className="text-gray-500">Loading photos...</p>
      ) : photos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-12 w-12 text-gray-300" />
            <p className="mt-4 text-gray-500">No site photos found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {photos.map((photo: SitePhoto) => (
            <Card key={photo.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {photo.url ? (
                  <img
                    src={photo.url}
                    alt={photo.caption}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <ImageIcon className="h-12 w-12 text-gray-300" />
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${categoryColors[photo.category] || 'bg-gray-100'}`}>
                    {photo.category}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 truncate">{photo.caption}</h3>
                <p className="mt-1 text-xs text-gray-500">{photo.projectName}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                  <span>{photo.takenBy}</span>
                  <span>{new Date(photo.takenAt).toLocaleDateString('en-GB')}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
