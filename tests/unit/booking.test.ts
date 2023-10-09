import { faker } from '@faker-js/faker';
import { createEnrollmentWithAddress, createUser } from '../factories';
import { bookingRepository, enrollmentRepository, ticketsRepository } from '@/repositories';
import { CreateBookingInput, ReservationInput } from '@/protocols';
import { bookingService, enrollmentsService, ticketsService } from '@/services';
import { generateValidToken } from '../helpers';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /booking', () => {
  it('should return a booking', async () => {
    const reservationInput: ReservationInput = {
      userId: faker.datatype.number({ min: 1, max: 5 }),
    };
    const mock = jest.spyOn(bookingRepository, 'getBooking');
    mock.mockImplementationOnce((): any => {
      return {
        id: faker.datatype.number({ min: 1, max: 10 }),
        Room: {
          id: faker.datatype.number({ min: 1, max: 10 }),
          name: faker.name.firstName(),
          capacity: faker.datatype.number({ min: 1, max: 5 }),
          hotelId: faker.datatype.number({ min: 1, max: 5 }),
          createdAt: faker.date.future(),
          updatedAt: faker.date.future(),
        },
      };
    });
    const reservation = await bookingService.getBooking(reservationInput.userId);
    expect(bookingRepository.getBooking).toBeCalledTimes(1);
    expect(reservation).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        Room: {
          id: expect.any(Number),
          name: expect.any(String),
          capacity: expect.any(Number),
          hotelId: expect.any(Number),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      }),
    );
  });
  it('should create a booking', async () => {
    const reservationInput: CreateBookingInput = {
      userId: faker.datatype.number({ min: 1, max: 5 }),
      roomId: faker.datatype.number({ min: 1, max: 5 }),
    };
    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockImplementationOnce(() => undefined);

    const mock = jest.spyOn(bookingRepository, 'createBooking');
    mock.mockImplementationOnce((): any => {
      return {
        bookingId: faker.datatype.number({ min: 1, max: 10 }),
      };
    });

    try {
      const reservation = await bookingService.createBooking(reservationInput.userId, reservationInput.roomId);
      expect(reservation).toEqual({ bookingId: expect.any(Number) });
    } catch (error) {
      // Capturar a exceção aqui
      expect(error).toEqual({
        name: 'EnrollmentNotFoundError',
        message: 'User is not enrolled in the event.',
      });
    }
  });
  it('return error 403 when enrollment does exist', async () => {
    const userId = 99999;
    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockImplementationOnce((): any => {
      return undefined;
    });
    const promise = enrollmentsService.getOneWithAddressByUserId(userId);

    expect(promise).rejects.toEqual({
      name: 'EnrollmentNotFoundError',
      message: 'User is not enrolled in the event.',
    });
  });
  it('return error 403 when ticket does exist', async () => {
    const userId = 9999;
    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockImplementationOnce((): any => {
      return 1;
    });
    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockImplementationOnce((): any => {
      return undefined;
    });
    const promise = ticketsService.getTicketByUserId(userId);
    expect(promise).rejects.toEqual({
      name: 'NotFoundError',
      message: 'No result for this search!',
    });
  });
  it('return error 403 when room does exist', async () => {
    const roomId = 9999;
    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockImplementationOnce((): any => {
      return 1;
    });
    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockImplementationOnce((): any => {
      return 1;
    });
    jest.spyOn(bookingRepository, 'getBooking').mockImplementationOnce((): any => {
      return undefined;
    });
    const promise = bookingService.getBooking(roomId);
    expect(promise).rejects.toEqual({
      name: 'NotFoundError',
      message: 'No result for this search!',
    });
  });
});
