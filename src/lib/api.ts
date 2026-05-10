import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { syncQueue } from './offlineStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

// Response interceptor: token refresh + offline queueing for mutations
let refreshPromise: Promise<string> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (!originalRequest) return Promise.reject(error);

    // 1. Token refresh on 401 (using httpOnly cookies — withCredentials)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!refreshPromise) {
        refreshPromise = refreshAccessToken();
      }

      try {
        const newToken = await refreshPromise;
        originalRequest.headers.set('Authorization', `Bearer ${newToken}`);
        return api(originalRequest);
      } catch {
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(error);
      } finally {
        refreshPromise = null;
      }
    }

    // 2. Offline mutation queueing (POST/PUT/PATCH/DELETE without 401)
    const method = originalRequest.method?.toUpperCase();
    const isMutation = method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    const isNetworkError = !error.response && isOnline() === false;

    if (isMutation && isNetworkError) {
      await syncQueue.enqueue({
        method: method as 'POST' | 'PUT' | 'PATCH' | 'DELETE',
        url: originalRequest.url || '',
        body: originalRequest.data,
        headers: Object.fromEntries(
          Object.entries(originalRequest.headers?.toJSON?.() || {})
            .map(([k, v]) => [k, String(v)])
        ),
      });
      // Return a synthetic success so the UI doesn't crash
      return Promise.resolve({
        data: { success: true, queued: true },
        status: 202,
        statusText: 'Accepted (queued offline)',
        headers: {},
        config: originalRequest,
      } as any);
    }

    return Promise.reject(error);
  }
);

async function refreshAccessToken(): Promise<string> {
  const res = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {}, { withCredentials: true });
  return res.data.data.accessToken;
}

// Replay queued requests when coming back online
if (typeof window !== 'undefined') {
  window.addEventListener('BUILDTRACK_REPLAY_REQUEST', async (event: Event) => {
    const detail = (event as CustomEvent).detail;
    if (!detail) return;
    try {
      await api.request({
        method: detail.method,
        url: detail.url,
        data: detail.body,
        headers: detail.headers || {},
      });
      await syncQueue.remove(detail.id);
    } catch (err) {
      const isStillOffline = !navigator.onLine;
      if (!isStillOffline) {
        await syncQueue.incrementRetry(detail.id);
        if (detail.retry_count >= 2) {
          // After 2 retries, drop the item to avoid infinite loops
          await syncQueue.remove(detail.id);
        }
      }
    }
  });
}
