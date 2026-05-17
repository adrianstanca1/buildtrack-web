'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Pencil, Trash2, Save, X, Users } from 'lucide-react';

interface TeamMember {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  avatar: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function TeamMemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<Partial<TeamMember>>({});

  const { data, isLoading } = useQuery<TeamMember>({
    queryKey: ['team-member', id],
    queryFn: async () => {
      const res = await api.get(`/team-members/${id}`);
      return res.data.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (body: Partial<TeamMember>) => {
      const res = await api.put(`/team-members/${id}`, body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-member', id] });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      setIsEditing(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/team-members/${id}`);
    },
    onSuccess: () => {
      router.push('/dashboard/team');
    },
  });

  if (isLoading || !data) {
    return <div className="py-12 text-center text-gray-500">Loading team member...</div>;
  }

  const member = data;

  const handleSave = () => {
    updateMutation.mutate(form);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to remove this team member?')) {
      deleteMutation.mutate();
    }
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-700',
    pending: 'bg-amber-100 text-amber-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/team')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Team Member Details</h1>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                <X className="mr-1 h-4 w-4" /> Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
                <Save className="mr-1 h-4 w-4" /> Save
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => { setForm(member); setIsEditing(true); }}>
                <Pencil className="mr-1 h-4 w-4" /> Edit
              </Button>
              <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleteMutation.isPending}>
                <Trash2 className="mr-1 h-4 w-4" /> Remove
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Name</label>
                <Input
                  value={form.name || ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Input
                  type="email"
                  value={form.email || ''}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Phone</label>
                <Input
                  value={form.phone || ''}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Role</label>
                <Input
                  value={form.role || ''}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Department</label>
                <Input
                  value={form.department || ''}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <select
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={form.status || 'active'}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} className="h-16 w-16 rounded-full object-cover" />
                  ) : (
                    member.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[member.status] || 'bg-gray-100 text-gray-700'}`}>
                      {member.status}
                    </span>
                  </div>
                  <h2 className="mt-1 text-xl font-semibold text-gray-900">{member.name}</h2>
                  <p className="text-gray-500">{member.role}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{member.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{member.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-medium text-gray-900">{member.department || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Joined</p>
                  <p className="font-medium text-gray-900">{new Date(member.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
