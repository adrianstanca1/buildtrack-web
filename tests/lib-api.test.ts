import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Use a fake API URL to verify env wiring. Set BEFORE importing the
// api module so the axios instance picks it up at module-eval time.
const FAKE_BASE = 'http://test.buildtrack.local';
process.env.NEXT_PUBLIC_API_URL = FAKE_BASE;

describe('api client wiring', () => {
  beforeEach(() => {
    vi.resetModules();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('axios instance uses NEXT_PUBLIC_API_URL + /api prefix', async () => {
    const { api } = await import('@/lib/api');
    expect(api.defaults.baseURL).toBe(`${FAKE_BASE}/api`);
  });

  it('withCredentials is true (httpOnly-cookie auth contract)', async () => {
    const { api } = await import('@/lib/api');
    // The CLAUDE.md auth model relies on this — disabling it silently
    // breaks login because cookies wouldn't be sent cross-origin in
    // dev (Metro on :8081 → API on :3001).
    expect(api.defaults.withCredentials).toBe(true);
  });

  it('Content-Type header is application/json', async () => {
    const { api } = await import('@/lib/api');
    // axios defaults.headers is a layered object; the JSON header is
    // attached at the common-method level.
    const ct =
      (api.defaults.headers as any)?.['Content-Type'] ||
      (api.defaults.headers as any)?.common?.['Content-Type'];
    expect(ct).toBe('application/json');
  });
});
