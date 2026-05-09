'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';
import { Circle, Clock, CheckCircle2 } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string;
  project_name?: string;
}

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Circle className="h-4 w-4 text-gray-400" />,
  'in-progress': <Clock className="h-4 w-4 text-blue-500" />,
  completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
};

const priorityColors: Record<string, string> = {
  low: 'text-gray-500',
  medium: 'text-blue-500',
  high: 'text-amber-500',
  urgent: 'text-red-500',
};

export function RecentTasks({ tasks }: { tasks: Task[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-4">No tasks yet</p>
          ) : (
            tasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-lg border p-3 hover:bg-gray-50"
              >
                <div className="mt-0.5">{statusIcons[task.status] || statusIcons.pending}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{task.project_name || 'No project'}</span>
                    {task.due_date && <span>• Due {formatDate(task.due_date)}</span>}
                  </div>
                </div>
                <span className={`text-xs font-medium ${priorityColors[task.priority]}`}>
                  {task.priority}
                </span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
