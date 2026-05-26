import { Role } from '@prisma/client';

import { HttpError } from '../../shared/http-error';
import { bookingRepository } from './booking.repository';

type CurrentUser = {
  id: number;
  role: Role;
};

function parseBookingRange(startTime?: string, endTime?: string) {
  const start = new Date(startTime || '');
  const end = new Date(endTime || '');

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new HttpError(400, 'Invalid date format');
  }

  if (start >= end) {
    throw new HttpError(400, 'The start time must be earlier than the end time');
  }

  return { start, end };
}

export const bookingService = {
  async createBooking(
    user: CurrentUser,
    input: { roomId?: number | string; startTime?: string; endTime?: string },
  ) {
    if (!input.roomId) {
      throw new HttpError(400, 'roomId is required');
    }

    const roomId = Number(input.roomId);
    const { start, end } = parseBookingRange(input.startTime, input.endTime);

    const conflict = await bookingRepository.findConflict(roomId, start, end);
    if (conflict) {
      throw new HttpError(409, 'This time already busy');
    }

    return bookingRepository.create({
      roomId,
      userId: user.id,
      startTime: start,
      endTime: end,
    });
  },

  getUserBookings(user: CurrentUser) {
    return bookingRepository.findByUser(user.id);
  },

  getAllBookings(user: CurrentUser) {
    if (user.role !== Role.ADMIN) {
      throw new HttpError(403, 'Доступ заборонено. Тільки для адмінів.');
    }

    return bookingRepository.findAll();
  },

  getBookingsByUserId(currentUser: CurrentUser, userId: number) {
    if (currentUser.role !== Role.ADMIN && currentUser.id !== userId) {
      throw new HttpError(403, 'Ви можете переглянути тільки свої бронювання');
    }

    return bookingRepository.findUpcomingByUser(userId);
  },

  async deleteBooking(user: CurrentUser, bookingId: number) {
    const booking = await bookingRepository.findById(bookingId);

    if (!booking) {
      throw new HttpError(404, 'Booking not found');
    }

    if (user.role !== Role.ADMIN && booking.userId !== user.id) {
      throw new HttpError(403, 'You can delete only your own bookings');
    }

    if (user.role !== Role.ADMIN && booking.startTime < new Date()) {
      throw new HttpError(400, 'You cannot delete past or ongoing bookings');
    }

    await bookingRepository.deleteById(bookingId);
  },
};
