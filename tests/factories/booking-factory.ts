import { prisma } from '@/config';

export async function createBooking(userId: number, roomId: number) {
  const result = await prisma.booking.create({
    data: {
      userId,
      roomId,
    },
  });
  const booking = { bookingId: result.id };
  return booking;
}
