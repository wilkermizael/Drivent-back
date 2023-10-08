import { Response } from 'express';
import httpStatus from 'http-status';
import { bookingService } from '@/services/booking-service';
import { AuthenticatedRequest } from '@/middlewares';

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const booking = await bookingService.getBooking(userId);
  return res.status(httpStatus.OK).send(booking);
}

export async function createBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body;
  const result = await bookingService.createBooking(userId, roomId);
  return res.status(httpStatus.OK).send(result);
}
export async function putBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body;
  const bookingId = Number(req.params.bookingId);
  const result = await bookingService.putBooking(userId, roomId, bookingId);
  return res.status(httpStatus.OK).send(result);
}
