import { Router } from 'express';

import {
  BookingCreateSchema,
  BookingStatusUpdateSchema,
  BookingsQuerySchema
} from '../../schemas/bookings';
import {
  createBooking,
  getBookingById,
  listBookings,
  updateBookingStatus
} from '../../services/bookingService';
import { asyncHandler } from '../../utils/asyncHandler';

export const bookingsRouter = Router();

/* eslint-disable @typescript-eslint/no-misused-promises */

bookingsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const parseResult = BookingsQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      return res.status(400).json({ message: 'Invalid query parameters', issues: parseResult.error.issues });
    }

    const result = await listBookings(parseResult.data);
    res.json(result);
  })
);

bookingsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Booking id must be numeric' });
    }

    const booking = await getBookingById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json({ data: booking });
  })
);

bookingsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const parseResult = BookingCreateSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: 'Invalid booking payload', issues: parseResult.error.issues });
    }

    const booking = await createBooking(parseResult.data);
    res.status(201).json({ data: booking });
  })
);

bookingsRouter.patch(
  '/:id/status',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Booking id must be numeric' });
    }

    const parseResult = BookingStatusUpdateSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: 'Invalid status payload', issues: parseResult.error.issues });
    }

    const booking = await updateBookingStatus(id, parseResult.data.status);
    res.json({ data: booking });
  })
);

/* eslint-enable @typescript-eslint/no-misused-promises */
