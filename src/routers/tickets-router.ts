import { Router } from 'express';
import { createTicket, getTicket, getTicketTypes } from '@/controllers';
import { authenticateToken, validateBody } from '@/middlewares';
import { ticketSchema } from '@/schemas/tickets-schemas';

const ticketsRouter = Router();

ticketsRouter
  .all('/*', authenticateToken)
  .get('/types', getTicketTypes)
  .get('/', getTicket)
  .post('/', validateBody(ticketSchema), createTicket);

export { ticketsRouter };
