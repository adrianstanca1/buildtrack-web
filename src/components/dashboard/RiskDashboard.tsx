'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { AlertTriangle, Clock, FileQuestion, FileCheck, HardHat, AlertCircle, TrendingUp } from 'lucide-react';

interface RiskData {
  summary: {
    overdueRfis: number;
    overdueSubmittals: number;
    openRfiCount: number;
    openSubmittalCount: number;
    missingDailyLogs: number;
  };
  projectHealth: Array<{
    id: string;
    name: string;
    open_rfis: number;
    open_submittals: number;
    open_defects: number;
    health: 'healthy' | 'warning' | 'at_risk';
  }>;
  slowResponders: Array<{ company: string; overdue_count: number }>;
}

const healthColors = {
  healthy: 'bg-green-100 text-green-700 border-green-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  at_risk: 'bg-red-100 text-red-700 border-red-200',
};

export default function RiskDashboard() {
  const { data, isLoading } = useQuery<{ data: RiskData }>({
    queryKey: ['risk-dashboard'],
    queryFn: async () => {
      const res = await api.get('/risk-dashboard');
      return res.data;
    },
  });

  const risk = data?.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Risk Dashboard</h2>
        <span className="text-xs text-gray-400">Live</span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <RiskCard
          icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
          label="Overdue RFIs"
          value={risk?.summary.overdueRfis ?? 0}
          alert={!!risk?.summary.overdueRfis}
        />
        <RiskCard
          icon={<Clock className="h-5 w-5 text-amber-500" />}
          label="Overdue Submittals"
          value={risk?.summary.overdueSubmittals ?? 0}
          alert={!!risk?.summary.overdueSubmittals}
        />
        <RiskCard
          icon={<FileQuestion className="h-5 w-5 text-blue-500" />}
          label="Open RFIs"
          value={risk?.summary.openRfiCount ?? 0}
        />
        <RiskCard
          icon={<FileCheck className="h-5 w-5 text-blue-500" />}
          label="Open Submittals"
          value={risk?.summary.openSubmittalCount ?? 0}
        />
        <RiskCard
          icon={<HardHat className="h-5 w-5 text-purple-500" />}
          label="Missing Logs"
          value={risk?.summary.missingDailyLogs ?? 0}
          alert={!!risk?.summary.missingDailyLogs}
        />
      </div>

      {/* Project Health */}
      {risk?.projectHealth && risk.projectHealth.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Project Health</h3>
            <div className="space-y-3">
              {risk.projectHealth.map((project) => (
                <div
                  key={project.id}
                  className={`flex items-center justify-between rounded-lg border p-3 ${healthColors[project.health]}`}
                >
                  <div className="flex-1">
                    <p className="font-medium">{project.name}</p>
                    <div className="mt-1 flex gap-3 text-xs">
                      {project.open_rfis > 0 && <span>{project.open_rfis} open RFIs</span>}
                      {project.open_submittals > 0 && <span>{project.open_submittals} open submittals</span>}
                      {project.open_defects > 0 && <span>{project.open_defects} open defects</span>}
                    </div>
                  </div>
                  <span className="text-xs font-medium capitalize">{project.health.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Slow Responders */}
      {risk?.slowResponders && risk.slowResponders.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Slow Responders</h3>
            <div className="space-y-2">
              {risk.slowResponders.map((responder) => (
                <div key={responder.company} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <span className="text-sm">{responder.company}</span>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium text-red-600">{responder.overdue_count} overdue</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function RiskCard({
  icon,
  label,
  value,
  alert,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  alert?: boolean;
}) {
  return (
    <Card className={alert ? 'border-red-200' : ''}>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`rounded-full p-2 ${alert ? 'bg-red-50' : 'bg-gray-50'}`}>{icon}</div>
        <div>
          <p className={`text-2xl font-bold ${alert ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
