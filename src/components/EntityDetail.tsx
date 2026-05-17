'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Trash2, Save } from 'lucide-react';

// Reusable detail+edit+delete page for any tenant-scoped CRUD entity
// whose backend follows the buildtrack-api convention:
//   GET    /api/<resource>/:id  → { data: T }
//   PUT    /api/<resource>/:id  → partial update
//   DELETE /api/<resource>/:id
//
// Pass a config describing the editable fields. Read-only metadata
// (project, created/updated, etc.) renders from `metaFields`.
//
// Tested against tasks/defects/rfis/daily-reports patterns; serves
// 14 more entities in this commit.

export type FieldType = 'text' | 'textarea' | 'date' | 'number' | 'select';

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  /** Override the value sent to the API (e.g. coerce to Number) */
  serialize?: (v: string) => unknown;
  /** Field key on the server-returned record (snake_case usually) */
  serverKey?: string;
}

export interface MetaField {
  label: string;
  /** Path on the record to render; supports nested via dot notation */
  render: (record: any) => ReactNode;
}

export interface PillSpec {
  field: string;
  colors: Record<string, string>;
}

export interface EntityDetailConfig {
  /** Human label, e.g. 'Drawing' */
  entityName: string;
  /** Plural human label, e.g. 'Drawings' */
  pluralName: string;
  /** API path under /api, e.g. '/drawings' */
  apiPath: string;
  /** Web back-link href, e.g. '/dashboard/drawings' */
  backHref: string;
  /** Field used for the page heading. Defaults to 'title'. */
  titleField?: string;
  /** Edit-form fields */
  fields: FieldDef[];
  /** Read-only meta (rendered as a 2-col grid when not editing) */
  metaFields?: MetaField[];
  /** Status / priority pills shown at the top of the read view */
  pills?: PillSpec[];
  /** Long-text fields to render as paragraphs in read view */
  longTextFields?: Array<{ key: string; label: string }>;
}

interface ServerEnvelope<T> {
  success: boolean;
  data: T;
}

export function EntityDetail({ config }: { config: EntityDetailConfig }) {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  const titleField = config.titleField || 'title';

  const q = useQuery<ServerEnvelope<Record<string, any>>>({
    queryKey: [config.apiPath, id],
    queryFn: async () => (await api.get(`${config.apiPath}/${id}`)).data,
    enabled: !!id,
  });
  const record = q.data?.data;

  // Hydrate form state from server data whenever it (re)loads.
  useEffect(() => {
    if (!record) return;
    const next: Record<string, string> = {};
    for (const f of config.fields) {
      const v = record[f.serverKey ?? f.key];
      if (v === null || v === undefined) {
        next[f.key] = '';
      } else if (f.type === 'date') {
        next[f.key] = String(v).slice(0, 10);
      } else {
        next[f.key] = String(v);
      }
    }
    setForm(next);
  }, [record, config.fields]);

  const update = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {};
      for (const f of config.fields) {
        const raw = form[f.key];
        if (f.type === 'number') {
          payload[f.key] = raw === '' ? null : Number(raw);
        } else if (raw === '' && !f.required) {
          payload[f.key] = null;
        } else if (f.serialize) {
          payload[f.key] = f.serialize(raw);
        } else {
          payload[f.key] = raw;
        }
      }
      return (await api.put(`${config.apiPath}/${id}`, payload)).data;
    },
    onSuccess: () => { setEditing(false); q.refetch(); },
    onError: (err: any) => setError(err.response?.data?.error?.message || 'Could not save.'),
  });

  const remove = useMutation({
    mutationFn: async () => (await api.delete(`${config.apiPath}/${id}`)).data,
    onSuccess: () => router.push(config.backHref),
    onError: (err: any) => setError(err.response?.data?.error?.message || 'Could not delete.'),
  });

  if (q.isLoading) return <p className="text-gray-500">Loading…</p>;
  if (!record) {
    return (
      <div className="space-y-4">
        <Link href={config.backHref} className="inline-flex items-center text-sm text-gray-500">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Link>
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            {config.entityName} not found, or you don&apos;t have access.
          </CardContent>
        </Card>
      </div>
    );
  }

  const title = record[titleField] ?? `${config.entityName} ${id.slice(0, 8)}`;

  return (
    <div className="max-w-3xl space-y-6">
      <Link href={config.backHref} className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to {config.pluralName.toLowerCase()}
      </Link>

      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <div className="flex gap-2">
          {!editing && (
            <Button type="button" variant="primary" onClick={() => setEditing(true)}>Edit</Button>
          )}
          <Button
            type="button"
            variant="ghost"
            onClick={() => { if (window.confirm(`Delete this ${config.entityName.toLowerCase()}? This cannot be undone.`)) remove.mutate(); }}
            loading={remove.isPending}
            title={`Delete ${config.entityName.toLowerCase()}`}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <Card>
        <CardContent className="space-y-4 p-6">
          {editing ? (
            <form onSubmit={(e) => { e.preventDefault(); update.mutate(); }} className="space-y-4">
              {config.fields.map((f) => {
                const value = form[f.key] ?? '';
                if (f.type === 'textarea') {
                  return (
                    <div key={f.key} className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">{f.label}</label>
                      <textarea
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        rows={3}
                        value={value}
                        onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                        required={f.required}
                      />
                    </div>
                  );
                }
                if (f.type === 'select') {
                  return (
                    <div key={f.key} className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">{f.label}</label>
                      <select
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        value={value}
                        onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                        required={f.required}
                      >
                        {!f.required && <option value="">—</option>}
                        {(f.options ?? []).map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                  );
                }
                return (
                  <Input
                    key={f.key}
                    type={f.type}
                    label={f.label}
                    value={value}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    required={f.required}
                  />
                );
              })}
              <div className="flex gap-2 pt-2">
                <Button type="submit" variant="primary" loading={update.isPending}>
                  <Save className="mr-1 h-4 w-4" /> Save changes
                </Button>
                <Button type="button" variant="ghost" onClick={() => { setEditing(false); setError(''); }}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {config.pills && config.pills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {config.pills.map((p) => {
                    const v = String(record[p.field] ?? '');
                    if (!v) return null;
                    const cls = p.colors[v] || 'bg-gray-100 text-gray-700';
                    return (
                      <span key={p.field} className={`rounded-full px-3 py-1 text-xs font-medium ${cls}`}>
                        {v}
                      </span>
                    );
                  })}
                </div>
              )}

              {config.longTextFields?.map(({ key, label }) => {
                const v = record[key];
                if (!v) return null;
                return (
                  <div key={key}>
                    <div className="text-xs font-medium uppercase text-gray-400">{label}</div>
                    <p className="mt-1 whitespace-pre-wrap text-gray-700">{v}</p>
                  </div>
                );
              })}

              {config.metaFields && config.metaFields.length > 0 && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {config.metaFields.map((m) => (
                    <div key={m.label}>
                      <div className="text-xs font-medium uppercase text-gray-400">{m.label}</div>
                      <div className="mt-1 text-gray-700">{m.render(record) ?? '—'}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                {record.created_at && (
                  <div>
                    <div className="text-xs font-medium uppercase text-gray-400">Created</div>
                    <div className="mt-1 text-gray-700">{formatDate(record.created_at)}</div>
                  </div>
                )}
                {record.updated_at && (
                  <div>
                    <div className="text-xs font-medium uppercase text-gray-400">Updated</div>
                    <div className="mt-1 text-gray-700">{formatDate(record.updated_at)}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
