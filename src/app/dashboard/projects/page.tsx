'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/lib/utils';
import { Search, Plus, Building2 } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  location: string;
  status: string;
  progress: number;
  budget: number;
  start_date: string;
  end_date: string;
}

export default function ProjectsPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['projects', search],
    queryFn: async () => {
      const res = await api.get('/projects', { params: { search } });
      return res.data;
    },
  });

  const projects = data?.data || [];

  const statusColors: Record<string, string> = {
    planning: 'bg-gray-100 text-gray-700',
    active: 'bg-blue-100 text-blue-700',
    'on-hold': 'bg-amber-100 text-amber-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <Button><Plus className="mr-2 h-4 w-4" /> New Project</Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {isLoading ? (
          <p className="text-gray-500">Loading projects...</p>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-gray-300" />
              <p className="mt-4 text-gray-500">No projects yet. Create your first project!</p>
            </CardContent>
          </Card>
        ) : (
          projects.map((project: Project) => (
            <Link key={project.id} href={`/dashboard/projects/${project.id}`} className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">{project.description}</p>
                      <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                        <span>{project.location}</span>
                        <span>•</span>
                        <span>{formatCurrency(project.budget)}</span>
                      </div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[project.status] || 'bg-gray-100'}`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-gray-900">{project.progress}%</span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
                      <div
                        className="h-2 rounded-full bg-blue-600 transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
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
