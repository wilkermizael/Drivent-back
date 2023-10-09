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
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);
async function fullCapacityOfTheRoom() {
  const hotel = await createHotel();
  const createRoom = await createRoomWithHotelId(hotel.id);
  let contador = createRoom.capacity;
  const roomId = { roomId: createRoom.id };
  while (contador > 0) {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(false, true);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    await server.post('/booking').set('Authorization', `Bearer ${token}`).send(roomId);
    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(roomId);
    expect(response.status).toBe(httpStatus.FORBIDDEN);
    contador = contador - 1;
  }
}
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
  it('show be response with status 403 when the room reaches its maximum capacity ', async () => {
    return await fullCapacityOfTheRoom();
  });
  it('show be response with status 403 when ticket is no presencial', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(true, true);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await createHotel();
    const createRoom = await createRoomWithHotelId(hotel.id);
    const roomId = { roomId: createRoom.id };
    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(roomId);
    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });
  it('show be response with status 403 when hotel is false', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(false, false);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await createHotel();
    const createRoom = await createRoomWithHotelId(hotel.id);
    const roomId = { roomId: createRoom.id };
    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(roomId);
    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });
  it('show be response with status 403 when ticket is not PAID', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(false, true);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
    const hotel = await createHotel();
    const createRoom = await createRoomWithHotelId(hotel.id);
    const roomId = { roomId: createRoom.id };
    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(roomId);
    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });
  it('should response with status 200 when create a reservation and return bookingId', async () => {
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

  it('should response with status 404 when roomId does not exist', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(false, true);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    await createHotel();
    const roomId = { roomId: 999999 };

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(roomId);
    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });
  it('should response with status 200 when create a reservation and return bookingId', async () => {
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
