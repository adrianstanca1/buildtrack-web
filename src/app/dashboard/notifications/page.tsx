'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { Bell, Check, Trash2, CheckCheck } from 'lucide-react';
import Link from 'next/link';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  created_at: string;
}

const typeColors: Record<string, string> = {
  task: 'bg-blue-100 text-blue-700',
  project: 'bg-purple-100 text-purple-700',
  safety: 'bg-red-100 text-red-700',
  team: 'bg-green-100 text-green-700',
  general: 'bg-gray-100 text-gray-700',
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data;
    },
  });

  const markRead = useMutation({
    mutationFn: (id: string) => api.put(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllRead = useMutation({
    mutationFn: () => api.put('/notifications/read-all'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const deleteNotification = useMutation({
    mutationFn: (id: string) => api.delete(`/notifications/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = data?.data?.notifications || [];
  const unreadCount = data?.data?.unreadCount || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && <p className="text-sm text-gray-500">{unreadCount} unread</p>}
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" onClick={() => markAllRead.mutate()} loading={markAllRead.isPending}>
            <CheckCheck className="mr-2 h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-12">
              <Bell className="h-12 w-12 text-gray-300" />
              <p className="mt-4 text-gray-500">No notifications.</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification: Notification) => (
            <Link key={notification.id} href={`/dashboard/notifications/${notification.id}`}>
              <Card className={`${notification.read ? 'opacity-60' : ''} cursor-pointer hover:shadow-md transition-shadow`}>
              <CardContent className="flex items-start justify-between p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Bell className={`h-5 w-5 ${notification.read ? 'text-gray-300' : 'text-blue-500'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{notification.title}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[notification.type] || typeColors.general}`}>
                        {notification.type}
                      </span>
                      {!notification.read && <span className="h-2 w-2 rounded-full bg-blue-500" />}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{notification.body}</p>
                    <p className="mt-2 text-xs text-gray-400">{formatDate(notification.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!notification.read && (
                    <button
                      onClick={() => markRead.mutate(notification.id)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification.mutate(notification.id)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
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
