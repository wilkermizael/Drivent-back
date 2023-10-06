import { ApplicationError } from '@/protocols';

export function enrollmentNotFoundError(): ApplicationError {
  return {
    name: 'EnrollmentNotFoundError',
    message: 'User is not enrolled in the event.',
  };
}
