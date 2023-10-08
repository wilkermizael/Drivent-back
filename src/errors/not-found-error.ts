import { ApplicationError } from '@/protocols';

export function notFoundError(resource?: string): ApplicationError {
  return {
    name: 'NotFoundError',
    //message: 'No result for this search!',
    message: resource ? `${resource}` : 'No result for this search!',
  };
}
