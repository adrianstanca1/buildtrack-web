'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Download, FileText } from 'lucide-react';

interface ExportTabProps {
  projectId: string;
}

const csvTables = ['rfis', 'submittals', 'drawings', 'defects', 'daily-reports', 'permits'];

export function ExportTab({ projectId }: ExportTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" /> Export Package
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">
            Generate an official project record package for closeout or dispute evidence.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <a
              href={`/api/exports/projects/${projectId}/closeout`}
              target="_blank"
              className="flex items-center gap-3 rounded-lg border p-4 hover:bg-gray-50 transition-colors"
            >
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-medium">Closeout Package</p>
                <p className="text-xs text-gray-500">PDF — Full project record</p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>CSV Exports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {csvTables.map((t) => (
              <a
                key={t}
                href={`/api/exports/projects/${projectId}/csv/${t}`}
                target="_blank"
                className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium capitalize">{t.replace('-', ' ')}</span>
                <Download className="h-4 w-4 text-gray-400" />
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
