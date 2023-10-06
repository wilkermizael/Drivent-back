import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { eventsService } from '@/services';

export async function getDefaultEvent(_req: Request, res: Response) {
  const event = await eventsService.getFirstEvent();
  return res.status(httpStatus.OK).send(event);
}
