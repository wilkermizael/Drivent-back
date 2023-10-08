import { prisma } from '@/config';

async function getBooking(userId: number) {
  const result = await prisma.booking.findFirst({
    where: { userId },
    select: {
      id: true,
      Room: {
        select: {
          id: true,
          name: true,
          capacity: true,
          hotelId: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });
  return result;
}
async function createBooking(userId: number, roomId: number) {
  const result = await prisma.booking.create({
    data: {
      userId,
      roomId,
    },
    select: { id: true },
  });
  const booking = { bookingId: result.id };
  return booking.bookingId;
}
async function findRoomById(roomId: number) {
  const result = await prisma.room.findUnique({
    where: { id: roomId },
  });
  return result;
}
async function findBooking(roomId: number) {
  const result = await prisma.booking.findMany({
    where: { roomId },
    select: { id: true },
  });
  return result.length;
}

async function putBooking(userId: number, roomId: number, bookingId: number) {
  await prisma.booking.delete({
    where: { id: bookingId },
  });
  return await createBooking(userId, roomId);
}
export const bookingRepository = {
  getBooking,
  createBooking,
  findRoomById,
  findBooking,
  putBooking,
};
