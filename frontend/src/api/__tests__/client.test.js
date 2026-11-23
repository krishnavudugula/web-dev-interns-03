import { describe, it, expect, vi, afterEach } from 'vitest';
import { api } from '../client';

describe('API Client', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('returns JSON data from a successful GET request', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({ message: 'Success' }),
    }));

    const result = await api.get('/health');

    expect(result).toEqual({ message: 'Success' });
    expect(fetch).toHaveBeenCalledOnce();
  });

  it('throws an error when the API request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({ message: 'Server error' }),
    }));

    await expect(api.get('/health')).rejects.toThrow('Server error');
  });
});
