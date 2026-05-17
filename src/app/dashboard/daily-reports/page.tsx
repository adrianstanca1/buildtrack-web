'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatDate } from '@/lib/utils';
import { Search, Plus, ClipboardList, Calendar } from 'lucide-react';
import Link from 'next/link';

interface DailyReport {
  id: string;
  project_id: string;
  project_name: string;
  report_date: string;
  weather: string | null;
  temperature: number | null;
  workers_on_site: number;
  work_completed: string | null;
  materials_used: string | null;
  equipment_used: string | null;
  issues_delays: string | null;
  safety_observations: string | null;
  next_day_plan: string | null;
  submitted_by: string;
  status: 'draft' | 'submitted' | 'approved';
  created_at: string;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
};

export default function DailyReportsPage() {
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['daily-reports', search, dateFilter],
    queryFn: async () => {
      const res = await api.get('/daily-reports', {
        params: { search, date: dateFilter },
      });
      return res.data;
    },
  });

  const reports = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Daily Reports</h1>
        <Link href="/dashboard/daily-reports/create">
          <Button><Plus className="mr-2 h-4 w-4" /> New Report</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search reports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <input
              type="date"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-gray-500">Loading daily reports...</p>
        ) : reports.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ClipboardList className="h-12 w-12 text-gray-300" />
              <p className="mt-4 text-gray-500">No daily reports found.</p>
            </CardContent>
          </Card>
        ) : (
          reports.map((report: DailyReport) => (
            <Link key={report.id} href={`/dashboard/daily-reports/${report.id}`}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">
                        {report.project_name}
                      </h3>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[report.status]}`}
                      >
                        {report.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {formatDate(report.report_date)}
                    </p>
                    {report.weather && (
                      <p className="mt-1 text-xs text-gray-400">
                        Weather: {report.weather}
                        {report.temperature !== null && ` • ${report.temperature}°C`}
                      </p>
                    )}
                    {report.work_completed && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {report.work_completed}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                      <span>Workers: {report.workers_on_site}</span>
                      {report.submitted_by && (
                        <>
                          <span>•</span>
                          <span>By {report.submitted_by}</span>
                        </>
                      )}
                    </div>
                  </div>
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
