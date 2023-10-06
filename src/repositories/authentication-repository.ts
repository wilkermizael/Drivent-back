import { Prisma } from '@prisma/client';
import { prisma } from '@/config';

async function createSession(data: Prisma.SessionUncheckedCreateInput) {
  return prisma.session.create({
    data,
  });
}

async function findSession(token: string) {
  return prisma.session.findFirst({
    where: {
      token,
    },
  });
}

export const authenticationRepository = {
  createSession,
  findSession,
};
