import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { InputPaymentBody } from '@/protocols';
import { paymentsService } from '@/services';

export async function getPaymentByTicketId(req: AuthenticatedRequest, res: Response) {
  const ticketId = Number(req.query.ticketId);
  const { userId } = req;

  const payment = await paymentsService.getPaymentByTicketId(userId, ticketId);
  return res.status(httpStatus.OK).send(payment);
}

export async function paymentProcess(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { ticketId, cardData } = req.body as InputPaymentBody;

  const payment = await paymentsService.paymentProcess(ticketId, userId, cardData);
  res.status(httpStatus.OK).send(payment);
}
