'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Save, Camera } from 'lucide-react';

export default function CreateSitePhotoPage() {
  const router = useRouter();
  const [photoUrl, setPhotoUrl] = useState('');
  const [location, setLocation] = useState('');
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');

  const createPhoto = useMutation({
    mutationFn: async () => {
      const res = await api.post('/site-photos', {
        photoUrl,
        location: location || undefined,
        caption: caption || undefined,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      return res.data;
    },
    onSuccess: () => {
      router.push('/dashboard/site-photos');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || err.message || 'Failed to add site photo');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!photoUrl.trim()) {
      setError('Photo URL is required');
      return;
    }
    createPhoto.mutate();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/site-photos">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add Site Photo</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Photo URL *</label>
              <Input value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://..." className="mt-1" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Site A, Floor 2" className="mt-1" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Caption</label>
              <Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Describe the photo..." className="mt-1" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="foundation, concrete, week-1" className="mt-1" />
            </div>

            {photoUrl && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Preview</p>
                <img src={photoUrl} alt="Preview" className="max-h-48 rounded-lg object-cover border" onError={(e) => (e.currentTarget.style.display = 'none')} />
              </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end gap-2">
              <Link href="/dashboard/site-photos">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={createPhoto.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {createPhoto.isPending ? 'Saving...' : 'Add Photo'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
