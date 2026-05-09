'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';

interface Project {
  name: string;
  budget: number;
  spent: number;
}

export function ProjectChart({ projects }: { projects: Project[] }) {
  const data = projects.map((p) => ({
    name: p.name,
    Budget: p.budget,
    Spent: p.spent || 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Budgets</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="Budget" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Spent" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
