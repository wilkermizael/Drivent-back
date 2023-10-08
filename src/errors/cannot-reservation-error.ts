import { ApplicationError } from '@/protocols';

export function cannotReservation(message: string): ApplicationError {
  return {
    name: 'CannotReservation',
    message,
  };
}
