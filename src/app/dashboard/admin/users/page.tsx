'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatDate } from '@/lib/utils';
import { Search, Users, Shield, Ban, CheckCircle2 } from 'lucide-react';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: async () => {
      const res = await api.get('/admin/users', { params: { search } });
      return res.data;
    },
  });

  const users: User[] = data?.data || [];

  const roleColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-700',
    manager: 'bg-purple-100 text-purple-700',
    supervisor: 'bg-blue-100 text-blue-700',
    worker: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <Button><Users className="mr-2 h-4 w-4" /> Invite User</Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500">User</th>
                <th className="px-4 py-3 font-medium text-gray-500">Role</th>
                <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500">Joined</th>
                <th className="px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          roleColors[user.role] || 'bg-gray-100'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`flex items-center gap-1 text-xs font-medium ${
                          user.status === 'active' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {user.status === 'active' ? (
                          <><CheckCircle2 className="h-3.5 w-3.5" /> Active</>
                        ) : (
                          <><Ban className="h-3.5 w-3.5" /> Inactive</>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm">
                        <Shield className="h-4 w-4" />
                      </Button>
                    </td>
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
