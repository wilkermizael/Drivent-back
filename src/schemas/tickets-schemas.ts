import Joi from 'joi';
import { InputTicketBody } from '@/protocols';

export const ticketSchema = Joi.object<InputTicketBody>({
  ticketTypeId: Joi.number().required(),
});
