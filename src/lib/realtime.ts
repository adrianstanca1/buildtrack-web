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

export type TaskEventType = 'task-created' | 'task-updated' | 'task-deleted' | 'task-completed';

export interface TaskEventPayload {
  type: TaskEventType;
  task: Record<string, any>;
  at: string;
}

/**
 * Join a project room and subscribe to its task events.
 * Returns a cleanup function that unsubscribes and leaves the room.
 *
 * Usage:
 *   useEffect(() => {
 *     return subscribeProject(projectId, (ev) => {
 *       if (ev.type === 'task-updated') queryClient.invalidateQueries(['tasks']);
 *     });
 *   }, [projectId]);
 */
export function subscribeProject(
  projectId: string,
  handler: (ev: TaskEventPayload) => void,
): () => void {
  const socket = getSocket();

  const onConnect = () => {
    socket.emit('join-project', projectId);
  };

  // If already connected, join right away — otherwise wait for the handshake.
  if (socket.connected) onConnect();
  else socket.on('connect', onConnect);

  const events: TaskEventType[] = [
    'task-created',
    'task-updated',
    'task-deleted',
    'task-completed',
  ];
  for (const ev of events) socket.on(ev, handler);

  return () => {
    for (const ev of events) socket.off(ev, handler);
    socket.off('connect', onConnect);
    try {
      socket.emit('leave-project', projectId);
    } catch {
      /* socket may already be disconnected — ignore */
    }
  };
}
