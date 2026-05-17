'use client';

// Socket.IO client wired against buildtrack-api's /socket.io/ endpoint.
//
// Backend (src/server.ts) emits the following events to the
// `project:<projectId>` room when a task mutates:
//   task-created     — POST /api/tasks
//   task-updated     — PUT  /api/tasks/:id
//   task-deleted     — DELETE /api/tasks/:id
//   task-completed   — POST /api/tasks/:id/complete
//
// Each payload is `{ type, task, at }`. Clients join a room via
// `socket.emit('join-project', projectId)` and leave via 'leave-project'.

import { io, Socket } from 'socket.io-client';

let socketRef: Socket | null = null;

// API base URL — same env override the axios client uses (lib/api.ts).
// In production buildtrack-web runs alongside buildtrack-api on the same
// host, so the default empty string works (Socket.IO will connect to the
// page origin). In dev with separate hosts, set NEXT_PUBLIC_API_BASE_URL.
function socketUrl(): string {
  if (typeof window === 'undefined') return '';
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (base) return base.replace(/\/api\/?$/, '');
  return window.location.origin;
}

export function getSocket(): Socket {
  if (socketRef && socketRef.connected) return socketRef;
  if (socketRef) return socketRef; // existing instance, possibly reconnecting
  socketRef = io(socketUrl(), {
    // Cookies (httpOnly access token) ride along for auth contexts that
    // need the session — Socket.IO needs withCredentials = true at the
    // engine.io layer to send the cookie on the websocket handshake.
    withCredentials: true,
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 8000,
    // Use websocket first; engine.io falls back to polling if needed.
    transports: ['websocket', 'polling'],
  });
  return socketRef;
}

export function disconnectSocket(): void {
  if (!socketRef) return;
  socketRef.disconnect();
  socketRef = null;
}

// Supported entity types that emit room events from buildtrack-api.
// Keep in sync with backend src/utils/realtime.ts:EntityName.
export type EntityKind =
  | 'task'
  | 'defect'
  | 'rfi'
  | 'daily-report';

export type EntityVerb = 'created' | 'updated' | 'deleted' | 'completed' | 'answered' | 'closed';
export type EventType = `${EntityKind}-${EntityVerb}`;

// The payload key matches the entity name converted to camelCase (e.g.
// 'daily-report' → 'dailyReport'). The server-side emitter builds the
// payload this way, so we mirror it here.
export interface EventPayload {
  type: EventType;
  // The row, keyed by the entity's camelCase name.
  [entityKey: string]: unknown;
  at: string;
}

// Legacy alias kept so older callers (tasks/[id] detail page) compile
// unchanged — the shape is the same as EventPayload.
export type TaskEventPayload = EventPayload & { task: Record<string, any> };
export type TaskEventType = Extract<EventType, `task-${EntityVerb}`>;

const ALL_EVENTS: EventType[] = [
  'task-created', 'task-updated', 'task-deleted', 'task-completed',
  'defect-created', 'defect-updated', 'defect-deleted',
  'rfi-created', 'rfi-updated', 'rfi-deleted', 'rfi-answered',
  'daily-report-created', 'daily-report-updated', 'daily-report-deleted',
];

/**
 * Join a project room and subscribe to its mutation events.
 * Returns a cleanup function that unsubscribes and leaves the room.
 *
 * Pass `kinds` to filter to specific entity types (e.g. on a task
 * detail page, only listen for 'task' events — defects don't matter
 * there). Omit `kinds` to receive everything.
 */
export function subscribeProject(
  projectId: string,
  handler: (ev: EventPayload) => void,
  kinds?: EntityKind[],
): () => void {
  const socket = getSocket();

  const onConnect = () => {
    socket.emit('join-project', projectId);
  };

  if (socket.connected) onConnect();
  else socket.on('connect', onConnect);

  const wantedEvents = kinds
    ? ALL_EVENTS.filter((ev) => kinds.some((k) => ev.startsWith(`${k}-`)))
    : ALL_EVENTS;

  for (const ev of wantedEvents) socket.on(ev, handler);

  return () => {
    for (const ev of wantedEvents) socket.off(ev, handler);
    socket.off('connect', onConnect);
    try {
      socket.emit('leave-project', projectId);
    } catch {
      /* socket may already be disconnected — ignore */
    }
  };
}
