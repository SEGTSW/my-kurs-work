import { Role } from '@prisma/client';
import { Router } from 'express';

import { auth, AuthenticatedRequest } from './auth.middleware';
import { HttpError } from './http-error';
import { prisma } from './prisma';

export const bookingRoutes = Router();

function requireUser(req: AuthenticatedRequest) {
  if (!req.user) {
    throw new HttpError(401, 'No token provided');
  }

  return req.user;
}

function parseRange(startTime?: string, endTime?: string) {
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

bookingRoutes.post('/', auth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = requireUser(req);
    const { roomId, startTime, endTime } = req.body as {
      roomId?: number | string;
      startTime?: string;
      endTime?: string;
    };

    if (!roomId) {
      throw new HttpError(400, 'roomId is required');
    }

    const parsedRoomId = Number(roomId);
    const { start, end } = parseRange(startTime, endTime);

    const conflict = await prisma.booking.findFirst({
      where: {
        roomId: parsedRoomId,
        AND: [
          { startTime: { lt: end } },
          { endTime: { gt: start } },
        ],
      },
    });

    if (conflict) {
      throw new HttpError(409, 'This time already busy');
    }

    const booking = await prisma.booking.create({
      data: {
        roomId: parsedRoomId,
        userId: user.id,
        startTime: start,
        endTime: end,
      },
    });

    return res.status(201).json(booking);
  } catch (err) {
    return next(err);
  }
});

bookingRoutes.get('/my', auth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = requireUser(req);
    const bookings = await prisma.booking.findMany({
      where: { userId: user.id },
      include: { room: true },
      orderBy: { startTime: 'asc' },
    });

    return res.json(bookings);
  } catch (err) {
    return next(err);
  }
});

bookingRoutes.delete('/:id', auth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = requireUser(req);
    const booking = await prisma.booking.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!booking) {
      throw new HttpError(404, 'Booking not found');
    }

    if (user.role !== Role.ADMIN && booking.userId !== user.id) {
      throw new HttpError(403, 'You can delete only your own bookings');
    }

    if (user.role !== Role.ADMIN && booking.startTime < new Date()) {
      throw new HttpError(400, 'You cannot delete past or ongoing bookings');
    }

    await prisma.booking.delete({ where: { id: booking.id } });
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

bookingRoutes.get('/', auth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = requireUser(req);
    if (user.role !== Role.ADMIN) {
      throw new HttpError(403, 'Доступ заборонено. Тільки для адмінів.');
    }

    const bookings = await prisma.booking.findMany({
      include: {
        room: true,
        user: { select: { email: true, role: true } },
      },
      orderBy: { startTime: 'asc' },
    });

    return res.json(bookings);
  } catch (err) {
    return next(err);
  }
});
