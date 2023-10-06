import Joi from 'joi';
import { InputPaymentBody } from '@/protocols';

export const paymentSchema = Joi.object<InputPaymentBody>({
  ticketId: Joi.number().required(),
  cardData: {
    issuer: Joi.string().required(),
    number: Joi.string().required(),
    name: Joi.string().required(),
    expirationDate: Joi.string().required(),
    cvv: Joi.string().required(),
  },
});
