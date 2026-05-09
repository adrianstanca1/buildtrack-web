'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';
import {
  ClipboardList,
  AlertTriangle,
  Building2,
  Users,
  CheckCircle2,
} from 'lucide-react';

interface Activity {
  id: string;
  type: 'task' | 'incident' | 'project' | 'worker' | 'inspection';
  title: string;
  description: string;
  created_at: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  task: <ClipboardList className="h-4 w-4 text-blue-500" />,
  incident: <AlertTriangle className="h-4 w-4 text-red-500" />,
  project: <Building2 className="h-4 w-4 text-purple-500" />,
  worker: <Users className="h-4 w-4 text-green-500" />,
  inspection: <CheckCircle2 className="h-4 w-4 text-amber-500" />,
};

const typeColors: Record<string, string> = {
  task: 'bg-blue-50',
  incident: 'bg-red-50',
  project: 'bg-purple-50',
  worker: 'bg-green-50',
  inspection: 'bg-amber-50',
};

export function ActivityFeed({ activities }: { activities: Activity[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-4">No recent activity</p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 rounded-lg p-3 hover:bg-gray-50">
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    typeColors[activity.type]
                  }`}
                >
                  {typeIcons[activity.type]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.description}</p>
                  <p className="mt-1 text-xs text-gray-400">{formatDate(activity.created_at)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
