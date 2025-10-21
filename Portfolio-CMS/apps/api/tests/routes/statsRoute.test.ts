import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

const mockClient = vi.hoisted(() => ({
  projects: { count: vi.fn() },
  messages: { count: vi.fn() },
  bookings: { count: vi.fn() }
}));

vi.mock('../../src/prisma', () => ({
  getPrismaClient: () => mockClient
}));

vi.mock('@portfolio-cms/config', () => ({
  loadEnvironment: () => ({
    NODE_ENV: 'test',
    PORT: 4000,
    SESSION_SECRET: 'test-secret-test-secret',
    LEGACY_ADMIN_URL: 'http://localhost:3000/admin',
    ALLOWED_ORIGINS: ''
  })
}));

import { createApp } from '../../src/app';

describe('GET /api/v2/stats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns aggregate counts', async () => {
    mockClient.projects.count.mockResolvedValue(5);
    mockClient.messages.count.mockResolvedValue(3);
    mockClient.bookings.count.mockResolvedValue(2);

    const app = createApp();
    const response = await request(app).get('/api/v2/stats');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      totalProjects: 5,
      unreadMessages: 3,
      pendingBookings: 2
    });
  });
});
