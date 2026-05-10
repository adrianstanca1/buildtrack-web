'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Plus, Wrench, AlertTriangle, CheckCircle, Clock, Truck } from 'lucide-react';

interface Equipment {
  id: string;
  project_name: string;
  name: string;
  type: string;
  make: string;
  model: string;
  serial_number: string;
  year: number;
  status: string;
  daily_rate: number;
  location: string;
  insurance_expiry: string;
  mot_expiry: string;
  maintenance_history: any[];
  created_at: string;
}

const typeLabels: Record<string, string> = {
  excavator: 'Excavator',
  bulldozer: 'Bulldozer',
  crane: 'Crane',
  loader: 'Loader',
  dump_truck: 'Dump Truck',
  mixer: 'Mixer',
  generator: 'Generator',
  scaffold: 'Scaffold',
  scissor_lift: 'Scissor Lift',
  forklift: 'Forklift',
  compactor: 'Compactor',
  other: 'Other',
};

const statusColors: Record<string, string> = {
  available: 'bg-green-100 text-green-700',
  rented: 'bg-blue-100 text-blue-700',
  on_site: 'bg-indigo-100 text-indigo-700',
  under_maintenance: 'bg-amber-100 text-amber-700',
  out_of_service: 'bg-red-100 text-red-700',
  retired: 'bg-gray-100 text-gray-500',
};

const statusIcons: Record<string, React.ReactNode> = {
  available: <CheckCircle className="h-4 w-4" />,
  rented: <Truck className="h-4 w-4" />,
  on_site: <Wrench className="h-4 w-4" />,
  under_maintenance: <Clock className="h-4 w-4" />,
  out_of_service: <AlertTriangle className="h-4 w-4" />,
  retired: <AlertTriangle className="h-4 w-4" />,
};

export default function EquipmentPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['equipment', search, statusFilter, typeFilter],
    queryFn: async () => {
      const res = await api.get('/equipment', {
        params: { search, status: statusFilter || undefined, type: typeFilter || undefined },
      });
      return res.data;
    },
  });

  const equipment = data?.data || [];

  const isExpiringSoon = (date: string) => {
    if (!date) return false;
    const d = new Date(date);
    const now = new Date();
    const days = Math.ceil((d.getTime() - now.getTime()) / 86400000);
    return days >= 0 && days <= 30;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Equipment</h1>
        <Link href="/dashboard/equipment/create">
          <Button><Plus className="mr-2 h-4 w-4" /> New Equipment</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search equipment..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:w-44"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              {Object.entries(typeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <select
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:w-44"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="available">Available</option>
              <option value="rented">Rented</option>
              <option value="on_site">On Site</option>
              <option value="under_maintenance">Under Maintenance</option>
              <option value="out_of_service">Out of Service</option>
              <option value="retired">Retired</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="py-12 text-center text-gray-500">Loading equipment...</div>
      ) : equipment.length === 0 ? (
        <div className="py-12 text-center text-gray-400">
          <Wrench className="mx-auto mb-3 h-12 w-12 opacity-40" />
          <p className="text-lg font-medium">No equipment yet</p>
          <p className="text-sm">Add your first asset.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {equipment.map((eq: Equipment) => (
            <Card key={eq.id} className="transition hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[eq.status] || statusColors.available}`}>
                        {eq.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-2.5 py-0.5">
                        {typeLabels[eq.type] || 'Other'}
                      </span>
                      {eq.maintenance_history?.length > 0 && (
                        <span className="text-xs text-blue-600 bg-blue-50 rounded-full px-2.5 py-0.5">
                          {eq.maintenance_history.length} service records
                        </span>
                      )}
                    </div>
                    <h3 className="mt-1 text-lg font-semibold text-gray-900 truncate">{eq.name}</h3>
                    <p className="text-sm text-gray-500">
                      {eq.make} {eq.model} {eq.year && `(${eq.year})`} • {eq.project_name || 'Unassigned'}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                      {eq.serial_number && (
                        <span className="font-mono text-xs">S/N: {eq.serial_number}</span>
                      )}
                      {eq.daily_rate > 0 && (
                        <span className="font-medium text-gray-700">£{eq.daily_rate}/day</span>
                      )}
                      {eq.location && (
                        <span>📍 {eq.location}</span>
                      )}
                    </div>
                    {(isExpiringSoon(eq.insurance_expiry) || isExpiringSoon(eq.mot_expiry)) && (
                      <div className="mt-2 flex gap-2">
                        {isExpiringSoon(eq.insurance_expiry) && (
                          <span className="text-xs text-amber-700 bg-amber-50 rounded-full px-2 py-0.5">⚠️ Insurance expires soon</span>
                        )}
                        {isExpiringSoon(eq.mot_expiry) && (
                          <span className="text-xs text-amber-700 bg-amber-50 rounded-full px-2 py-0.5">⚠️ MOT expires soon</span>
                        )}
                      </div>
                    )}
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
