import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { syncQueue } from './offlineStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

// Request interceptor: attach auth token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// Response interceptor: token refresh + offline queueing for mutations
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (!originalRequest) return Promise.reject(error);

    // 1. Token refresh on 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {}, { withCredentials: true });
        const newToken = refreshResponse.data.data.accessToken;
        localStorage.setItem('accessToken', newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers.set('Authorization', `Bearer ${newToken}`);
        return api(originalRequest);
      } catch {
        localStorage.removeItem('accessToken');
        if (typeof window !== 'undefined') window.location.href = '/login';
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
        headers: {
          ...(originalRequest.headers?.toJSON?.() || {}),
        },
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
