import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { ticketsService } from '@/services';
import { InputTicketBody } from '@/protocols';

export async function getTicketTypes(req: AuthenticatedRequest, res: Response) {
  const ticketTypes = await ticketsService.findTicketTypes();
  return res.status(httpStatus.OK).send(ticketTypes);
}

export async function getTicket(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const ticket = await ticketsService.getTicketByUserId(userId);
  res.status(httpStatus.OK).send(ticket);
}

export async function createTicket(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { ticketTypeId } = req.body as InputTicketBody;

  const ticket = await ticketsService.createTicket(userId, ticketTypeId);
  return res.status(httpStatus.CREATED).send(ticket);
}
