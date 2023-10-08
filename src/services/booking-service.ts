import { cannotReservation, enrollmentNotFoundError, invalidDataError, notFoundError } from '@/errors';
import { enrollmentRepository, ticketsRepository } from '@/repositories';
import { bookingRepository } from '@/repositories/booking-repository';

async function getBooking(userId: number) {
  const getReservation = await bookingRepository.getBooking(userId);
  if (!getReservation) throw notFoundError();
  return getReservation;
}

async function createBooking(userId: number, roomId: number) {
  if (!roomId || isNaN(roomId)) throw invalidDataError('roomId');
  //REGRAS DE NEGÓCIO: TICKET PAGO, SER PRESENCIAL, INCLUIR HOTEL
  console.log(userId, roomId);
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw enrollmentNotFoundError();
  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) throw notFoundError('O ticket não existe');
  if (
    ticket.status === 'RESERVED' ||
    ticket.TicketType.isRemote === true ||
    ticket.TicketType.includesHotel === false
  ) {
    throw notFoundError('O ticket dever ser pago, ser presencial e ter hotel cadastrado');
  }
  //QUARTO NÃO EXISTE LANÇA ERRO 404
  const room = await bookingRepository.findRoomById(roomId);
  if (!room) throw notFoundError();
  // EXISTE VAGA NO QUARTO?
  const booking = await bookingRepository.findBooking(roomId);
  if (booking >= room.capacity) throw cannotReservation('Full capacity the room');
  const createReservation = await bookingRepository.createBooking(userId, roomId);
  return createReservation;
}
async function putBooking(userId: number, roomId: number, bookingId: number) {
  if (!roomId || isNaN(roomId)) throw invalidDataError('roomId'); // SE O roomId NÃO FOR PASSADO
  const room = await bookingRepository.findRoomById(roomId); // SE O QUARTO NÃO EXISTIR
  if (!room) throw notFoundError('Esse quarto não existe');
  const getReservation = await bookingRepository.getBooking(userId); //SE O USUÁRIO POSSUI RESERVA
  if (!getReservation) throw notFoundError();
  const booking = await bookingRepository.findBooking(roomId);
  if (booking === room.capacity) throw cannotReservation('Full capacity the room'); //CAPACIDADE DO QUARTO JA FOI ATINGIDA
  const result = await bookingRepository.putBooking(userId, roomId, bookingId);
  return result;
}

export const bookingService = {
  getBooking,
  createBooking,
  putBooking,
};
