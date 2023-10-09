import faker from '@faker-js/faker';
import httpStatus from 'http-status';
import supertest from 'supertest';
import { TicketStatus } from '@prisma/client';
import { cleanDb, generateValidToken } from '../helpers';
import {
  createBooking,
  createEnrollmentWithAddress,
  createPayment,
  createTicket,
  createTicketType,
  createUser,
} from '../factories';
import { createHotel, createRoomWithHotelId } from '../factories/hotels-factory';
import { prisma } from '@/config';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  it('User should have a booking', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(false, true);
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    await createPayment(ticket.id, ticketType.price);
    const hotel = await createHotel();
    await createRoomWithHotelId(hotel.id);

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });
  it('should respond with status 200 when booking is created', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(false, true);
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    await createPayment(ticket.id, ticketType.price);
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    const booking = await createBooking(user.id, room.id);

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
    expect(response.status).toEqual(httpStatus.OK);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: booking.bookingId,
        Room: {
          id: room.id,
          name: room.name,
          capacity: room.capacity,
          hotelId: hotel.id,
          createdAt: room.createdAt.toISOString(),
          updatedAt: room.updatedAt.toISOString(),
        },
      }),
    );
  });
});
describe('POST /booking', () => {
  it('should be create a reservation', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(false, true);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await createHotel();
    const createRoom = await createRoomWithHotelId(hotel.id);
    const roomId = { roomId: createRoom.id };

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(roomId);
    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toEqual({ bookingId: expect.any(Number) });
  });
});
