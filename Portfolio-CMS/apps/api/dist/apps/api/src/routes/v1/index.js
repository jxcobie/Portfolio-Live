import { Router } from 'express';
import { bookingsV1Router } from './bookings';
import { messagesV1Router } from './messages';
import { projectsV1Router } from './projects';
export const v1Router = Router();
v1Router.use('/projects', projectsV1Router);
v1Router.use('/messages', messagesV1Router);
v1Router.use('/bookings', bookingsV1Router);
