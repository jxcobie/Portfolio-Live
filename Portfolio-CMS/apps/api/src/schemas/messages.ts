import { z } from 'zod';

export const MessagesQuerySchema = z.object({
  status: z.enum(['unread', 'read']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
});

export const MessageReadSchema = z.object({
  read: z.boolean()
});

export type MessagesQueryInput = z.infer<typeof MessagesQuerySchema>;
