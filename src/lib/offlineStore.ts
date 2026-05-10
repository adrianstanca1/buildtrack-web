import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface ProjectRecord {
  id: string;
  name: string;
  description: string;
  location: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  progress: number;
  budget: number;
  spent?: number;
  start_date: string;
  end_date: string;
  latitude?: number;
  longitude?: number;
  updated_at: string;
}

export interface TaskRecord {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed';
  due_date: string;
  project_id?: string;
  project_name?: string;
  assignee?: string;
  updated_at: string;
}

export interface WorkerRecord {
  id: string;
  name: string;
  role: string;
  status: string;
  phone: string;
  email: string;
  hourly_rate: number;
  weekly_hours: number;
  updated_at: string;
}

export interface IncidentRecord {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  date: string;
  injuries: number;
  project_id?: string;
  project_name: string;
  updated_at: string;
}

export interface InspectionRecord {
  id: string;
  title: string;
  inspector_name: string;
  description: string;
  status: 'pending' | 'passed' | 'failed';
  date: string;
  project_id?: string;
  project_name: string;
  updated_at: string;
}

export interface PendingChange {
  id: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  body: unknown;
  headers?: Record<string, string>;
  timestamp: number;
  retry_count: number;
}

interface BuildTrackDB extends DBSchema {
  projects: { key: string; value: ProjectRecord };
  tasks: { key: string; value: TaskRecord };
  workers: { key: string; value: WorkerRecord };
  incidents: { key: string; value: IncidentRecord };
  inspections: { key: string; value: InspectionRecord };
  syncQueue: { key: string; value: PendingChange };
}

const DB_NAME = 'buildtrack-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<BuildTrackDB>> | null = null;

function getDB(): Promise<IDBPDatabase<BuildTrackDB>> {
  if (dbPromise) return dbPromise;
  dbPromise = openDB<BuildTrackDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('projects')) db.createObjectStore('projects', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('tasks')) db.createObjectStore('tasks', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('workers')) db.createObjectStore('workers', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('incidents')) db.createObjectStore('incidents', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('inspections')) db.createObjectStore('inspections', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('syncQueue')) db.createObjectStore('syncQueue', { keyPath: 'id' });
    },
  });
  return dbPromise;
}

function nowIso(): string {
  return new Date().toISOString();
}

// Generic CRUD helpers
async function getAll<T extends keyof BuildTrackDB>(store: T): Promise<BuildTrackDB[T]['value'][]> {
  const db = await getDB();
  return db.getAll(store as any);
}

async function getById<T extends keyof BuildTrackDB>(store: T, id: string): Promise<BuildTrackDB[T]['value'] | undefined> {
  const db = await getDB();
  return db.get(store as any, id);
}

async function putRecord<T extends keyof BuildTrackDB>(store: T, value: BuildTrackDB[T]['value']): Promise<void> {
  const db = await getDB();
  await db.put(store as any, value);
}

async function deleteRecord<T extends keyof BuildTrackDB>(store: T, id: string): Promise<void> {
  const db = await getDB();
  await db.delete(store as any, id);
}

async function clearStore<T extends keyof BuildTrackDB>(store: T): Promise<void> {
  const db = await getDB();
  await db.clear(store as any);
}

// Table-specific CRUD
export const offlineProjects = {
  getAll: () => getAll('projects'),
  getById: (id: string) => getById('projects', id),
  put: (record: ProjectRecord) => putRecord('projects', { ...record, updated_at: nowIso() }),
  delete: (id: string) => deleteRecord('projects', id),
  clear: () => clearStore('projects'),
};

export const offlineTasks = {
  getAll: () => getAll('tasks'),
  getById: (id: string) => getById('tasks', id),
  put: (record: TaskRecord) => putRecord('tasks', { ...record, updated_at: nowIso() }),
  delete: (id: string) => deleteRecord('tasks', id),
  clear: () => clearStore('tasks'),
};

export const offlineWorkers = {
  getAll: () => getAll('workers'),
  getById: (id: string) => getById('workers', id),
  put: (record: WorkerRecord) => putRecord('workers', { ...record, updated_at: nowIso() }),
  delete: (id: string) => deleteRecord('workers', id),
  clear: () => clearStore('workers'),
};

export const offlineIncidents = {
  getAll: () => getAll('incidents'),
  getById: (id: string) => getById('incidents', id),
  put: (record: IncidentRecord) => putRecord('incidents', { ...record, updated_at: nowIso() }),
  delete: (id: string) => deleteRecord('incidents', id),
  clear: () => clearStore('incidents'),
};

export const offlineInspections = {
  getAll: () => getAll('inspections'),
  getById: (id: string) => getById('inspections', id),
  put: (record: InspectionRecord) => putRecord('inspections', { ...record, updated_at: nowIso() }),
  delete: (id: string) => deleteRecord('inspections', id),
  clear: () => clearStore('inspections'),
};

// Sync queue
export const syncQueue = {
  async enqueue(change: Omit<PendingChange, 'id' | 'timestamp' | 'retry_count'>): Promise<void> {
    const db = await getDB();
    const record: PendingChange = {
      ...change,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: Date.now(),
      retry_count: 0,
    };
    await db.put('syncQueue', record);
    // Request background sync if available
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      await (registration as any).sync?.register?.('buildtrack-sync');
    }
  },

  async getAll(): Promise<PendingChange[]> {
    const db = await getDB();
    return db.getAll('syncQueue');
  },

  async getPendingCount(): Promise<number> {
    const db = await getDB();
    return db.count('syncQueue');
  },

  async remove(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('syncQueue', id);
  },

  async clear(): Promise<void> {
    const db = await getDB();
    await db.clear('syncQueue');
  },

  async incrementRetry(id: string): Promise<void> {
    const db = await getDB();
    const record = await db.get('syncQueue', id);
    if (record) {
      record.retry_count += 1;
      await db.put('syncQueue', record);
    }
  },
};

// Bulk replace helpers (used when syncing GET responses)
export async function bulkReplaceProjects(records: ProjectRecord[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('projects', 'readwrite');
  await tx.store.clear();
  for (const r of records) await tx.store.put({ ...r, updated_at: nowIso() });
  await tx.done;
}

export async function bulkReplaceTasks(records: TaskRecord[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('tasks', 'readwrite');
  await tx.store.clear();
  for (const r of records) await tx.store.put({ ...r, updated_at: nowIso() });
  await tx.done;
}

export async function bulkReplaceWorkers(records: WorkerRecord[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('workers', 'readwrite');
  await tx.store.clear();
  for (const r of records) await tx.store.put({ ...r, updated_at: nowIso() });
  await tx.done;
}

export async function bulkReplaceIncidents(records: IncidentRecord[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('incidents', 'readwrite');
  await tx.store.clear();
  for (const r of records) await tx.store.put({ ...r, updated_at: nowIso() });
  await tx.done;
}

export async function bulkReplaceInspections(records: InspectionRecord[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('inspections', 'readwrite');
  await tx.store.clear();
  for (const r of records) await tx.store.put({ ...r, updated_at: nowIso() });
  await tx.done;
}
