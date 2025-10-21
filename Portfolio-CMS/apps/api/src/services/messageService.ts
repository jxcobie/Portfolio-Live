import { Prisma } from '../../../../generated/prisma';
import { getPrismaClient } from '../prisma';
import type { MessagesQueryInput } from '../schemas/messages';

const prisma = getPrismaClient();

export async function listMessages(params: MessagesQueryInput) {
  const { page, pageSize, status } = params;

  const where: Prisma.messagesWhereInput = {};

  if (status === 'unread') {
    where.OR = [{ is_read: false }, { is_read: null }];
  }

  if (status === 'read') {
    where.is_read = true;
  }

  const skip = (page - 1) * pageSize;

  const [total, data] = await Promise.all([
    prisma.messages.count({ where }),
    prisma.messages.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: pageSize
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

export function getMessageById(id: number) {
  return prisma.messages.findUnique({ where: { id } });
}

export async function markMessageRead(id: number, read: boolean) {
  return prisma.messages.update({
    where: { id },
    data: { is_read: read }
  });
}

export async function archiveMessage(id: number, archived: boolean) {
  return prisma.messages.update({
    where: { id },
    data: { is_archived: archived }
  });
}
