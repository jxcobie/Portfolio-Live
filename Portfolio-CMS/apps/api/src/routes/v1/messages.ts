import { Router } from 'express';

import { MessagesQuerySchema } from '../../schemas/messages';
import { getMessageById, listMessages, markMessageRead } from '../../services/messageService';
import { asyncHandler } from '../../utils/asyncHandler';

export const messagesV1Router = Router();

/* eslint-disable @typescript-eslint/no-misused-promises */

messagesV1Router.get(
  '/',
  asyncHandler(async (req, res) => {
    const parseResult = MessagesQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      return res.status(400).json({ message: 'Invalid query parameters', issues: parseResult.error.issues });
    }

    const result = await listMessages(parseResult.data);
    res.json(result);
  })
);

messagesV1Router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Message id must be numeric' });
    }

    const message = await getMessageById(id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json({ data: message });
  })
);

messagesV1Router.patch(
  '/:id/read',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Message id must be numeric' });
    }

    const read = Boolean(req.body?.read ?? true);

    const updated = await markMessageRead(id, read);
    res.json({ data: updated });
  })
);

/* eslint-enable @typescript-eslint/no-misused-promises */
