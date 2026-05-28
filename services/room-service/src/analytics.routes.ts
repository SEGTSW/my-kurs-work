import { Role } from '@prisma/client';
import { Router } from 'express';

import { auth, authorize } from './auth.middleware';
import { prisma } from './prisma';

export const analyticsRoutes = Router();

analyticsRoutes.get('/', auth, authorize([Role.ADMIN]), async (_req, res, next) => {
  try {
    const [totalBookings, totalRooms, totalUsers, roomsWithBookings] = await Promise.all([
      prisma.booking.count(),
      prisma.room.count(),
      prisma.user.count(),
      prisma.room.findMany({
        include: {
          _count: {
            select: { bookings: true },
          },
        },
        orderBy: { id: 'asc' },
      }),
    ]);

    return res.json({
      totalBookings,
      totalRooms,
      totalUsers,
      bookingsPerRoom: roomsWithBookings.map((room) => ({
        name: room.name,
        count: room._count.bookings,
      })),
    });
  } catch (err) {
    return next(err);
  }
});
