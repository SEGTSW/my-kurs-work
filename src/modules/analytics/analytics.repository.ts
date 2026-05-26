import { prisma } from '../../lib/prisma';

export const analyticsRepository = {
  countBookings() {
    return prisma.booking.count();
  },

  countRooms() {
    return prisma.room.count();
  },

  countUsers() {
    return prisma.user.count();
  },

  findRoomsWithBookingCounts() {
    return prisma.room.findMany({
      include: {
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: { id: 'asc' },
    });
  },
};
