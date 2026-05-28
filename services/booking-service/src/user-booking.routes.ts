import { Role } from '@prisma/client';
import { Router } from 'express';

import { auth, AuthenticatedRequest } from './auth.middleware';
import { HttpError } from './http-error';
import { prisma } from './prisma';

export const userBookingRoutes = Router();

userBookingRoutes.get('/:id/bookings', auth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const currentUser = req.user;
    const userId = Number(req.params.id);

    if (!currentUser) {
      throw new HttpError(401, 'No token provided');
    }

    if (currentUser.role !== Role.ADMIN && currentUser.id !== userId) {
      throw new HttpError(403, 'Ви можете переглянути тільки свої бронювання');
    }

    const bookings = await prisma.booking.findMany({
      where: {
        userId,
        startTime: { gte: new Date() },
      },
      include: { room: true },
      orderBy: { startTime: 'asc' },
    });

    return res.json(bookings);
  } catch (err) {
    return next(err);
  }
});
