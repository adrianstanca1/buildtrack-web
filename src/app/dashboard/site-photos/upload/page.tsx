'use client';

import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function UploadPhotoPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    caption: '',
    category: 'general',
    projectId: '',
    takenBy: '',
    takenAt: '',
  });
  const [file, setFile] = useState<File | null>(null);

  const upload = useMutation({
    mutationFn: async () => {
      const data = new FormData();
      if (file) data.append('file', file);
      data.append('caption', form.caption);
      data.append('category', form.category);
      data.append('projectId', form.projectId);
      data.append('takenBy', form.takenBy);
      if (form.takenAt) data.append('takenAt', form.takenAt);

      const res = await api.post('/site-photos', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-photos'] });
      router.push('/dashboard/site-photos');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to upload photo');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selected);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!file) {
      setError('Please select a photo to upload');
      return;
    }
    if (!form.caption || !form.projectId || !form.takenBy) {
      setError('Caption, project, and taken by are required');
      return;
    }
    upload.mutate();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/site-photos">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Upload Site Photo</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Photo Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-red-600">{error}</p>}

            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              {preview ? (
                <img src={preview} alt="Preview" className="mx-auto h-40 w-auto rounded-lg object-contain" />
              ) : (
                <>
                  <ImageIcon className="mx-auto h-10 w-10 text-gray-400" />
                  <p className="mt-2 text-sm font-medium text-gray-700">Click to select a photo</p>
                  <p className="text-xs text-gray-500">JPG, PNG, WEBP up to 10MB</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <Input label="Caption" value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} required />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="progress">Progress</option>
                  <option value="issue">Issue</option>
                  <option value="safety">Safety</option>
                  <option value="quality">Quality</option>
                  <option value="general">General</option>
                </select>
              </div>
              <Input label="Project ID" type="number" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Taken By" value={form.takenBy} onChange={(e) => setForm({ ...form, takenBy: e.target.value })} required />
              <Input label="Taken At" type="date" value={form.takenAt} onChange={(e) => setForm({ ...form, takenAt: e.target.value })} />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Link href="/dashboard/site-photos">
                <Button variant="outline" type="button">Cancel</Button>
              </Link>
              <Button type="submit" loading={upload.isPending}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Photo
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
