import { Router } from 'express';
import { MessageReadSchema, MessagesQuerySchema } from '../../schemas/messages';
import { archiveMessage, getMessageById, listMessages, markMessageRead } from '../../services/messageService';
import { asyncHandler } from '../../utils/asyncHandler';
export const messagesRouter = Router();
/* eslint-disable @typescript-eslint/no-misused-promises */
messagesRouter.get('/', asyncHandler(async (req, res) => {
    const parseResult = MessagesQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
        return res.status(400).json({ message: 'Invalid query parameters', issues: parseResult.error.issues });
    }
    const result = await listMessages(parseResult.data);
    res.json(result);
}));
messagesRouter.get('/:id', asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
        return res.status(400).json({ message: 'Message id must be numeric' });
    }
    const message = await getMessageById(id);
    if (!message) {
        return res.status(404).json({ message: 'Message not found' });
    }
    res.json({ data: message });
}));
messagesRouter.patch('/:id/read', asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
        return res.status(400).json({ message: 'Message id must be numeric' });
    }
    const parseResult = MessageReadSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({ message: 'Invalid body payload', issues: parseResult.error.issues });
    }
    const updated = await markMessageRead(id, parseResult.data.read);
    res.json({ data: updated });
}));
messagesRouter.patch('/:id/archive', asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
        return res.status(400).json({ message: 'Message id must be numeric' });
    }
    const archived = req.body?.archived;
    if (typeof archived !== 'boolean') {
        return res.status(400).json({ message: 'Body must include `archived` boolean' });
    }
    const updated = await archiveMessage(id, archived);
    res.json({ data: updated });
}));
/* eslint-enable @typescript-eslint/no-misused-promises */
