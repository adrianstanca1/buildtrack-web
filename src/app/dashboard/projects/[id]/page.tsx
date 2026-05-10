'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Building2, MapPin, DollarSign, Calendar, ArrowLeft, TrendingUp,
  Users, FileQuestion, FileCheck, Image, Bug, ClipboardList,
  HardHat, Clock, AlertTriangle, Activity, ShoppingCart, Wrench,
} from 'lucide-react';
import { ExportTab } from '@/components/projects/ExportTab';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

interface Project {
  id: string;
  name: string;
  description: string;
  location: string;
  status: string;
  progress: number;
  budget: number;
  spent: number;
  start_date: string;
  end_date: string;
}

interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  planning: 'bg-gray-100 text-gray-700',
  active: 'bg-blue-100 text-blue-700',
  'on-hold': 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const typeIcons: Record<string, React.ReactNode> = {
  drawing: <Image className="h-4 w-4 text-purple-500" />,
  rfi: <FileQuestion className="h-4 w-4 text-blue-500" />,
  submittal: <FileCheck className="h-4 w-4 text-green-500" />,
  daily_report: <ClipboardList className="h-4 w-4 text-amber-500" />,
  defect: <Bug className="h-4 w-4 text-red-500" />,
  audit: <Activity className="h-4 w-4 text-gray-500" />,
  meeting: <Calendar className="h-4 w-4 text-indigo-500" />,
};

const typeColors: Record<string, string> = {
  drawing: 'bg-purple-50',
  rfi: 'bg-blue-50',
  submittal: 'bg-green-50',
  daily_report: 'bg-amber-50',
  defect: 'bg-red-50',
  audit: 'bg-gray-50',
  meeting: 'bg-indigo-50',
};

type TabKey = 'overview' | 'rfis' | 'submittals' | 'drawings' | 'defects' | 'daily-reports' | 'meetings' | 'purchase-orders' | 'equipment' | 'timeline' | 'exports';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const { data: projectData } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const res = await api.get(`/projects/${id}`);
      return res.data.data;
    },
  });

  const { data: timelineData } = useQuery({
    queryKey: ['project-timeline', id],
    queryFn: async () => {
      const res = await api.get(`/projects/${id}/timeline`);
      return res.data.data;
    },
    enabled: activeTab === 'timeline',
  });

  const { data: rfisData } = useQuery({
    queryKey: ['project-rfis', id],
    queryFn: async () => {
      const res = await api.get('/rfis', { params: { projectId: id } });
      return res.data.data;
    },
    enabled: activeTab === 'rfis',
  });

  const { data: submittalsData } = useQuery({
    queryKey: ['project-submittals', id],
    queryFn: async () => {
      const res = await api.get('/submittals', { params: { projectId: id } });
      return res.data.data;
    },
    enabled: activeTab === 'submittals',
  });

  const { data: drawingsData } = useQuery({
    queryKey: ['project-drawings', id],
    queryFn: async () => {
      const res = await api.get('/drawings', { params: { projectId: id } });
      return res.data.data;
    },
    enabled: activeTab === 'drawings',
  });

  const { data: defectsData } = useQuery({
    queryKey: ['project-defects', id],
    queryFn: async () => {
      const res = await api.get('/defects', { params: { projectId: id } });
      return res.data.data;
    },
    enabled: activeTab === 'defects',
  });

  const { data: dailyReportsData } = useQuery({
    queryKey: ['project-daily-reports', id],
    queryFn: async () => {
      const res = await api.get('/daily-reports', { params: { projectId: id } });
      return res.data.data;
    },
    enabled: activeTab === 'daily-reports',
  });

  const { data: meetingsData } = useQuery({
    queryKey: ['project-meetings', id],
    queryFn: async () => {
      const res = await api.get('/meetings', { params: { projectId: id } });
      return res.data.data;
    },
    enabled: activeTab === 'meetings',
  });

  const { data: purchaseOrdersData } = useQuery({
    queryKey: ['project-purchase-orders', id],
    queryFn: async () => {
      const res = await api.get('/purchase-orders', { params: { projectId: id } });
      return res.data.data;
    },
    enabled: activeTab === 'purchase-orders',
  });

  const { data: equipmentData } = useQuery({
    queryKey: ['project-equipment', id],
    queryFn: async () => {
      const res = await api.get('/equipment', { params: { projectId: id } });
      return res.data.data;
    },
    enabled: activeTab === 'equipment',
  });

  const project: Project = projectData;
  const timeline: TimelineEvent[] = timelineData?.events || [];
  const rfis = rfisData || [];
  const submittals = submittalsData || [];
  const drawings = drawingsData || [];
  const defects = defectsData || [];
  const dailyReports = dailyReportsData || [];
  const meetings = meetingsData || [];
  const purchaseOrders = purchaseOrdersData || [];
  const equipment = equipmentData || [];

  if (!project) {
    return <div className="p-8">Loading...</div>;
  }

  const chartData = [
    { name: 'Budget', value: project.budget },
    { name: 'Spent', value: project.spent || 0 },
    { name: 'Remaining', value: Math.max(0, project.budget - (project.spent || 0)) },
  ];

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'rfis', label: 'RFIs', count: rfis.length },
    { key: 'submittals', label: 'Submittals', count: submittals.length },
    { key: 'drawings', label: 'Drawings', count: drawings.length },
    { key: 'defects', label: 'Defects', count: defects.length },
    { key: 'daily-reports', label: 'Daily Reports', count: dailyReports.length },
    { key: 'meetings', label: 'Meetings', count: meetings.length },
    { key: 'purchase-orders', label: 'POs', count: purchaseOrders.length },
    { key: 'equipment', label: 'Equipment', count: equipment.length },
    { key: 'timeline', label: 'Timeline', count: timeline.length },
    { key: 'exports', label: 'Exports' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/projects">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          <p className="mt-1 text-gray-500">{project.description}</p>
          <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {project.location}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" /> {formatDate(project.start_date)} –{' '}
              {formatDate(project.end_date)}
            </span>
          </div>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[project.status] || 'bg-gray-100'}`}>
          {project.status}
        </span>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.key ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-1.5 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  {tab.count}
                </span>
              )}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm text-gray-500">Budget</p>
                  <p className="mt-1 text-xl font-bold">{formatCurrency(project.budget)}</p>
                </div>
                <div className="rounded-lg bg-blue-50 p-3">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm text-gray-500">Spent</p>
                  <p className="mt-1 text-xl font-bold">{formatCurrency(project.spent || 0)}</p>
                </div>
                <div className="rounded-lg bg-amber-50 p-3">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm text-gray-500">Progress</p>
                  <p className="mt-1 text-xl font-bold">{project.progress}%</p>
                </div>
                <div className="rounded-lg bg-green-50 p-3">
                  <Building2 className="h-5 w-5 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress bar */}
          <Card>
            <CardHeader><CardTitle>Project Progress</CardTitle></CardHeader>
            <CardContent>
              <div className="h-4 w-full rounded-full bg-gray-100">
                <div className="h-4 rounded-full bg-blue-600 transition-all" style={{ width: `${project.progress}%` }} />
              </div>
              <p className="mt-2 text-sm text-gray-500">{project.progress}% complete</p>
            </CardContent>
          </Card>

          {/* Budget Chart */}
          <Card>
            <CardHeader><CardTitle>Budget Overview</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'rfis' && (
        <div className="space-y-3">
          {rfis.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-gray-500">No RFIs for this project.</CardContent></Card>
          ) : rfis.map((r: any) => (
            <Card key={r.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <FileQuestion className="h-5 w-5 text-blue-500" />
                  <div className="flex-1">
                    <p className="font-medium">{r.subject}</p>
                    <p className="text-sm text-gray-500">{r.question}</p>
                    <div className="mt-1 flex gap-2 text-xs text-gray-400">
                      <span>Status: {r.status}</span>
                      {r.due_date && <span>• Due: {formatDate(r.due_date)}</span>}
                      {r.ball_in_court && <span>• Ball in court</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'submittals' && (
        <div className="space-y-3">
          {submittals.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-gray-500">No submittals for this project.</CardContent></Card>
          ) : submittals.map((s: any) => (
            <Card key={s.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <FileCheck className="h-5 w-5 text-green-500" />
                  <div className="flex-1">
                    <p className="font-medium">{s.submittal_number} — {s.title}</p>
                    <p className="text-sm text-gray-500">{s.type} • {s.status}</p>
                    {s.ball_in_court && (
                      <p className="mt-1 text-xs text-amber-600">Ball in court: {s.ball_in_court}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'drawings' && (
        <div className="space-y-3">
          {drawings.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-gray-500">No drawings for this project.</CardContent></Card>
          ) : drawings.map((d: any) => (
            <Card key={d.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Image className="h-5 w-5 text-purple-500" />
                  <div className="flex-1">
                    <p className="font-medium">{d.title}</p>
                    <div className="flex gap-2 text-xs text-gray-400">
                      <span>v{d.version || '1.0'}</span>
                      <span>• {d.status}</span>
                      {d.current && <span className="text-green-600">Current</span>}
                      {d.superseded && <span className="text-red-600">Superseded</span>}
                    </div>
                    <a href={d.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">View File</a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'defects' && (
        <div className="space-y-3">
          {defects.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-gray-500">No defects for this project.</CardContent></Card>
          ) : defects.map((d: any) => (
            <Card key={d.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Bug className="h-5 w-5 text-red-500" />
                  <div className="flex-1">
                    <p className="font-medium">{d.title}</p>
                    <p className="text-sm text-gray-500">{d.severity} • {d.status}</p>
                    {d.location && <p className="text-xs text-gray-400">{d.location}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'daily-reports' && (
        <div className="space-y-3">
          {dailyReports.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-gray-500">No daily reports for this project.</CardContent></Card>
          ) : dailyReports.map((r: any) => (
            <Card key={r.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <ClipboardList className="h-5 w-5 text-amber-500" />
                  <div className="flex-1">
                    <p className="font-medium">{formatDate(r.report_date)}</p>
                    <p className="text-sm text-gray-500">By {r.submitted_by} • {r.status}</p>
                    {r.work_completed && <p className="text-xs text-gray-400 line-clamp-2">{r.work_completed}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'meetings' && (
        <div className="space-y-3">
          {meetings.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-gray-500">No meetings for this project.</CardContent></Card>
          ) : meetings.map((m: any) => (
            <Card key={m.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-indigo-500" />
                  <div className="flex-1">
                    <p className="font-medium">{m.title}</p>
                    <p className="text-sm text-gray-500">{m.meeting_type?.replace('_', ' ')} • {m.status}</p>
                    {m.scheduled_at && <p className="text-xs text-gray-400">{new Date(m.scheduled_at).toLocaleString()}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'purchase-orders' && (
        <div className="space-y-3">
          {purchaseOrders.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-gray-500">No purchase orders for this project.</CardContent></Card>
          ) : purchaseOrders.map((po: any) => (
            <Card key={po.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-5 w-5 text-emerald-500" />
                  <div className="flex-1">
                    <p className="font-medium">{po.po_number} — {po.title}</p>
                    <p className="text-sm text-gray-500">{po.vendor_name} • {po.status.replace('_', ' ')}</p>
                    {po.total > 0 && <p className="text-xs font-medium text-gray-700">£{po.total?.toLocaleString?.()}</p>}
                    {po.delivery_date && <p className="text-xs text-gray-400">Due: {formatDate(po.delivery_date)}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'equipment' && (
        <div className="space-y-3">
          {equipment.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-gray-500">No equipment for this project.</CardContent></Card>
          ) : equipment.map((eq: any) => (
            <Card key={eq.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Wrench className="h-5 w-5 text-slate-500" />
                  <div className="flex-1">
                    <p className="font-medium">{eq.name}</p>
                    <p className="text-sm text-gray-500">{eq.type?.replace('_', ' ')} • {eq.status?.replace('_', ' ')}</p>
                    {eq.serial_number && <p className="text-xs text-gray-400">S/N: {eq.serial_number}</p>}
                    {eq.daily_rate > 0 && <p className="text-xs font-medium text-gray-700">£{eq.daily_rate}/day</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="space-y-3">
          {timeline.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-gray-500">No activity recorded yet.</CardContent></Card>
          ) : (
            <div className="relative space-y-4 pl-8 before:absolute before:left-3 before:top-0 before:bottom-0 before:w-px before:bg-gray-200">
              {timeline.map((event: TimelineEvent) => (
                <div key={event.id} className="relative">
                  <div className={`absolute -left-5 flex h-6 w-6 items-center justify-center rounded-full ${typeColors[event.type] || 'bg-gray-50'}`}>
                    {typeIcons[event.type] || <Activity className="h-4 w-4 text-gray-500" />}
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-sm text-gray-500">{event.description}</p>
                    <p className="mt-1 text-xs text-gray-400">{formatDate(event.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {activeTab === 'exports' && <ExportTab projectId={id as string} />}
    </div>
  );
}
