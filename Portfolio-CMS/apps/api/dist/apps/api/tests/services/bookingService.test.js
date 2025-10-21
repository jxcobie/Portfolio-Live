import { describe, expect, it, vi, beforeEach } from 'vitest';
const mockClient = vi.hoisted(() => ({
    bookings: {
        count: vi.fn(),
        findMany: vi.fn()
    }
}));
vi.mock('../../src/prisma', () => ({
    getPrismaClient: () => mockClient
}));
import { listBookings } from '../../src/services/bookingService';
describe('bookingService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it('applies upcoming filter', async () => {
        mockClient.bookings.count.mockResolvedValue(1);
        mockClient.bookings.findMany.mockResolvedValue([
            {
                id: 1,
                name: 'Client',
                email: 'client@example.com',
                date: new Date().toISOString().split('T')[0],
                time: '10:00',
                duration: 60,
                status: 'confirmed',
                meeting_type: 'call',
                notes: null,
                booking_reminders: []
            }
        ]);
        const result = await listBookings({ page: 1, pageSize: 10, status: undefined, date: undefined, upcoming: true });
        expect(mockClient.bookings.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({ AND: expect.any(Array) })
        }));
        expect(result.data).toHaveLength(1);
    });
});
