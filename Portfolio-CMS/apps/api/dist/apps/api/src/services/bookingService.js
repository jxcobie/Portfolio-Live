import { getPrismaClient } from '../prisma';
const prisma = getPrismaClient();
export async function listBookings(params) {
    const { page, pageSize, status, date, upcoming } = params;
    const andFilters = [];
    if (status) {
        andFilters.push({ status });
    }
    if (date) {
        andFilters.push({ date });
    }
    if (upcoming) {
        const today = new Date().toISOString().split('T')[0];
        andFilters.push({ date: { gte: today } });
        andFilters.push({ status: 'confirmed' });
    }
    const where = andFilters.length ? { AND: andFilters } : {};
    const skip = (page - 1) * pageSize;
    const [total, data] = await Promise.all([
        prisma.bookings.count({ where }),
        prisma.bookings.findMany({
            where,
            orderBy: [{ date: 'asc' }, { time: 'asc' }],
            skip,
            take: pageSize,
            include: {
                booking_reminders: true
            }
        })
    ]);
    return {
        data,
        meta: {
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize) || 1
        }
    };
}
export function getBookingById(id) {
    return prisma.bookings.findUnique({
        where: { id },
        include: { booking_reminders: true }
    });
}
export function createBooking(input) {
    return prisma.bookings.create({
        data: {
            ...input,
            status: 'confirmed'
        }
    });
}
export function updateBookingStatus(id, status) {
    return prisma.bookings.update({
        where: { id },
        data: {
            status,
            updated_at: new Date()
        }
    });
}
