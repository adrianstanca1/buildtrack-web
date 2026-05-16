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
    useAuthStore.setState({ user: null, isAuthenticated: false });
  });

  it('initial state is unauthenticated', () => {
    const s = useAuthStore.getState();
    expect(s.user).toBeNull();
    expect(s.isAuthenticated).toBe(false);
  });

  it('setAuth marks the user authenticated', () => {
    useAuthStore.getState().setAuth(TEST_USER);
    const s = useAuthStore.getState();
    expect(s.isAuthenticated).toBe(true);
    expect(s.user?.email).toBe('alice@buildtrack.test');
  });

  it('logout clears user + flag in one transition', () => {
    useAuthStore.getState().setAuth(TEST_USER);
    useAuthStore.getState().logout();
    const s = useAuthStore.getState();
    expect(s.user).toBeNull();
    expect(s.isAuthenticated).toBe(false);
  });

  it('User type uses snake_case field names (backend contract)', () => {
    useAuthStore.getState().setAuth(TEST_USER);
    const u = useAuthStore.getState().user!;
    expect(u.first_name).toBe('Alice');
    expect(u.last_name).toBe('Builder');
  });
});
