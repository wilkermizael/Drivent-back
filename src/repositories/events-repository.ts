import { prisma } from '@/config';

async function findFirst() {
  return prisma.event.findFirst();
}

export const eventRepository = {
  findFirst,
};
