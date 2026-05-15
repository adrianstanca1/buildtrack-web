'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Plus, Users, Phone, Mail, Briefcase } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  trade: string;
  status: string;
  phone: string;
  email: string;
  hourly_rate: number;
  cscs_card: string;
  project_name: string;
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-700',
  'on-leave': 'bg-amber-100 text-amber-700',
};

export default function TeamMembersPage() {
  const [search, setSearch] = useState('');
  const [tradeFilter, setTradeFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['team-members', search, tradeFilter],
    queryFn: async () => {
      const res = await api.get('/team-members', {
        params: { search, trade: tradeFilter || undefined },
      });
      return res.data;
    },
  });

  const members = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
        <Link href="/dashboard/team-members/create">
          <Button><Plus className="mr-2 h-4 w-4" /> Add Team Member</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search team members..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="sm:w-48">
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={tradeFilter}
                onChange={(e) => setTradeFilter(e.target.value)}
              >
                <option value="">All Trades</option>
                <option value="Foreman">Foreman</option>
                <option value="Electrician">Electrician</option>
                <option value="Plumber">Plumber</option>
                <option value="Carpenter">Carpenter</option>
                <option value="Mason">Mason</option>
                <option value="Laborer">Laborer</option>
                <option value="Engineer">Engineer</option>
                <option value="Safety Officer">Safety Officer</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : members.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center py-12">
              <Users className="h-12 w-12 text-gray-300" />
              <p className="mt-4 text-gray-500">No team members added yet.</p>
            </CardContent>
          </Card>
        ) : (
          members.map((member: TeamMember) => (
            <Card key={member.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{member.name}</h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      statusColors[member.status] || 'bg-gray-100'
                    }`}
                  >
                    {member.status}
                  </span>
                </div>
                <div className="mt-3 space-y-1 text-sm text-gray-500">
                  {member.trade && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-3.5 w-3.5" />
                      {member.trade}
                    </div>
                  )}
                  {member.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5" />
                      {member.phone}
                    </div>
                  )}
                  {member.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5" />
                      {member.email}
                    </div>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-gray-500">£{member.hourly_rate}/hr</span>
                  {member.cscs_card && (
                    <span className="text-xs text-gray-400">CSCS: {member.cscs_card}</span>
                  )}
                </div>
                {member.project_name && (
                  <div className="mt-2 text-xs text-gray-400">{member.project_name}</div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
