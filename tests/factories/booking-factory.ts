import { prisma } from '@/config';

export async function createBooking(userId: number, roomId: number) {
  await prisma.booking.create({
    data: {
      userId,
      roomId,
    },
  });
}
