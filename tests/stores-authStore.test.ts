import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/stores/authStore';

const TEST_USER = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'alice@buildtrack.test',
  first_name: 'Alice',
  last_name: 'Builder',
  role: 'admin',
};

describe('authStore (zustand)', () => {
  beforeEach(() => {
    // Reset between tests. The persist middleware syncs to localStorage,
    // but jsdom's localStorage is per-test-window so we still need to
    // clear the store state manually.
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
  });

  it('initial state is unauthenticated', () => {
    const s = useAuthStore.getState();
    expect(s.user).toBeNull();
    expect(s.token).toBeNull();
    expect(s.isAuthenticated).toBe(false);
  });

  it('setAuth marks the user authenticated', () => {
    useAuthStore.getState().setAuth(TEST_USER, 'fake-jwt-token');
    const s = useAuthStore.getState();
    expect(s.isAuthenticated).toBe(true);
    expect(s.user?.email).toBe('alice@buildtrack.test');
    expect(s.token).toBe('fake-jwt-token');
  });

  it('logout clears user + token + flag in one transition', () => {
    useAuthStore.getState().setAuth(TEST_USER, 'fake-jwt-token');
    useAuthStore.getState().logout();
    const s = useAuthStore.getState();
    expect(s.user).toBeNull();
    expect(s.token).toBeNull();
    expect(s.isAuthenticated).toBe(false);
  });

  it('User type uses snake_case field names (backend contract)', () => {
    useAuthStore.getState().setAuth(TEST_USER, 't');
    // first_name / last_name are the backend's column names. If somebody
    // changes the User shape to firstName/lastName this test will fail at
    // compile time (via tsc) AND at runtime.
    const u = useAuthStore.getState().user!;
    expect(u.first_name).toBe('Alice');
    expect(u.last_name).toBe('Builder');
  });
});
