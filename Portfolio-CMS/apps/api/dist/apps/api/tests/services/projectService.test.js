import { describe, expect, it, vi, beforeEach } from 'vitest';
const mockClient = vi.hoisted(() => ({
    projects: {
        count: vi.fn(),
        findMany: vi.fn()
    }
}));
vi.mock('../../src/prisma', () => ({
    getPrismaClient: () => mockClient
}));
import { listProjects } from '../../src/services/projectService';
describe('projectService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it('returns projects with pagination metadata', async () => {
        mockClient.projects.count.mockResolvedValue(2);
        mockClient.projects.findMany.mockResolvedValue([
            { id: 1, title: 'Test', slug: 'test', status: 'published', short_description: null }
        ]);
        const result = await listProjects({ page: 1, pageSize: 20, status: undefined, search: undefined });
        expect(result.meta.total).toBe(2);
        expect(mockClient.projects.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 20, skip: 0 }));
    });
});
