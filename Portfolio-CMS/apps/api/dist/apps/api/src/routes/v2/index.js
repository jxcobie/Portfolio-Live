import { Router } from 'express';
import { getPrismaClient } from '../../prisma';
import { asyncHandler } from '../../utils/asyncHandler';
import { bookingsRouter } from './bookings';
import { messagesRouter } from './messages';
import { projectsRouter } from './projects';
export const v2Router = Router();
const prisma = getPrismaClient();
/* eslint-disable @typescript-eslint/no-misused-promises */
v2Router.use('/projects', projectsRouter);
v2Router.use('/messages', messagesRouter);
v2Router.use('/bookings', bookingsRouter);
v2Router.get('/stats', asyncHandler(async (_req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const [projectsCount, unreadMessagesCount, upcomingBookings] = await Promise.all([
        prisma.projects.count(),
        prisma.messages.count({
            where: {
                OR: [{ is_read: false }, { is_read: null }]
            }
        }),
        prisma.bookings.count({
            where: {
                status: 'confirmed',
                date: { gte: today }
            }
        })
    ]);
    res.json({
        totalProjects: projectsCount,
        pendingBookings: upcomingBookings,
        unreadMessages: unreadMessagesCount
    });
}));
