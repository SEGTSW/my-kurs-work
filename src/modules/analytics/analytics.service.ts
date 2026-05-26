import { analyticsRepository } from './analytics.repository';

export const analyticsService = {
  async getAnalytics() {
    const [totalBookings, totalRooms, totalUsers, roomsWithBookings] = await Promise.all([
      analyticsRepository.countBookings(),
      analyticsRepository.countRooms(),
      analyticsRepository.countUsers(),
      analyticsRepository.findRoomsWithBookingCounts(),
    ]);

    return {
      totalBookings,
      totalRooms,
      totalUsers,
      bookingsPerRoom: roomsWithBookings.map((room) => ({
        name: room.name,
        count: room._count.bookings,
      })),
    };
  },
};
