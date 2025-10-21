import { Prisma } from '../../../../generated/prisma';
import { getPrismaClient } from '../prisma';
import type { BookingsQueryInput } from '../schemas/bookings';

const prisma = getPrismaClient();

export async function listBookings(params: BookingsQueryInput) {
  const { page, pageSize, status, date, upcoming } = params;

  const andFilters: Prisma.bookingsWhereInput[] = [];

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

  const where: Prisma.bookingsWhereInput = andFilters.length ? { AND: andFilters } : {};

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

export function getBookingById(id: number) {
  return prisma.bookings.findUnique({
    where: { id },
    include: { booking_reminders: true }
  });
}

interface CreateBookingInput {
  name: string;
  email: string;
  phone?: string;
  date: string;
  time: string;
  duration: number;
  meeting_type: string;
  notes?: string;
}

export function createBooking(input: CreateBookingInput) {
  return prisma.bookings.create({
    data: {
      ...input,
      status: 'confirmed'
    }
  });
}

export function updateBookingStatus(id: number, status: string) {
  return prisma.bookings.update({
    where: { id },
    data: {
      status,
      updated_at: new Date()
    }
  });
}
