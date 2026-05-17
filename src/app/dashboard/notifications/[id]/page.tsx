'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Check, Trash2, Bell } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  entity_type: string;
  entity_id: string;
  is_read: boolean;
  created_at: string;
  read_at: string;
}

export default function NotificationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const { data, isLoading } = useQuery<Notification>({
    queryKey: ['notification', id],
    queryFn: async () => {
      const res = await api.get(`/notifications/${id}`);
      return res.data.data;
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async () => {
      await api.patch(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification', id] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/notifications/${id}`);
    },
    onSuccess: () => {
      router.push('/dashboard/notifications');
    },
  });

  if (isLoading || !data) {
    return <div className="py-12 text-center text-gray-500">Loading notification...</div>;
  }

  const notification = data;

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this notification?')) {
      deleteMutation.mutate();
    }
  };

  const typeIcons: Record<string, string> = {
    info: '🔵',
    warning: '🟡',
    error: '🔴',
    success: '🟢',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/notifications')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Notification Details</h1>
        </div>
        <div className="flex items-center gap-2">
          {!notification.is_read && (
            <Button size="sm" onClick={() => markReadMutation.mutate()} disabled={markReadMutation.isPending}>
              <Check className="mr-1 h-4 w-4" /> Mark as Read
            </Button>
          )}
          <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleteMutation.isPending}>
            <Trash2 className="mr-1 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <Card className={notification.is_read ? 'opacity-75' : ''}>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="text-2xl">{typeIcons[notification.type] || '🔵'}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500 uppercase">{notification.type}</span>
                {!notification.is_read && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Unread</span>
                )}
              </div>
              <h2 className="mt-1 text-xl font-semibold text-gray-900">{notification.title}</h2>
              <p className="mt-2 text-gray-700">{notification.message}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-gray-500">Entity Type</p>
              <p className="font-medium text-gray-900">{notification.entity_type || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p className="font-medium text-gray-900">{new Date(notification.created_at).toLocaleString()}</p>
            </div>
            {notification.is_read && (
              <div>
                <p className="text-sm text-gray-500">Read</p>
                <p className="font-medium text-gray-900">{notification.read_at ? new Date(notification.read_at).toLocaleString() : '-'}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
