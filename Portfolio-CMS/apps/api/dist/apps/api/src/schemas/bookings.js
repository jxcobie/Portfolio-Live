import { z } from 'zod';
export const BookingStatusEnum = z.enum(['confirmed', 'cancelled', 'completed', 'no-show']);
export const BookingsQuerySchema = z.object({
    status: BookingStatusEnum.optional(),
    date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional(),
    upcoming: z.coerce.boolean().optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20)
});
export const BookingCreateSchema = z.object({
    name: z.string().trim().min(1),
    email: z.string().email(),
    phone: z.string().trim().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    time: z.string().regex(/^\d{2}:\d{2}$/),
    duration: z.number().int().min(15).max(480),
    meeting_type: z.string().trim().min(1),
    notes: z.string().trim().optional()
});
export const BookingStatusUpdateSchema = z.object({
    status: BookingStatusEnum
});
