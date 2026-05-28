import { Role } from '@prisma/client';
import { Router } from 'express';

import { auth, authorize } from './auth.middleware';
import { HttpError } from './http-error';
import { prisma } from './prisma';
import { serializeRoom } from './room.mapper';

export const roomRoutes = Router();

roomRoutes.get('/', auth, async (_req, res, next) => {
  try {
    const rooms = await prisma.room.findMany({ orderBy: { id: 'asc' } });
    return res.json(rooms.map(serializeRoom));
  } catch (err) {
    return next(err);
  }
});

roomRoutes.get('/available', auth, async (req, res, next) => {
  try {
    const { startTime, endTime } = req.query as { startTime?: string; endTime?: string };

    if (!startTime || !endTime) {
      throw new HttpError(400, 'startTime and endTime are required');
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) {
      throw new HttpError(400, 'Invalid time range');
    }

    const rooms = await prisma.room.findMany({
      where: {
        bookings: {
          none: {
            AND: [
              { startTime: { lt: end } },
              { endTime: { gt: start } },
            ],
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    return res.json(rooms.map(serializeRoom));
  } catch (err) {
    return next(err);
  }
});

roomRoutes.post('/', auth, authorize([Role.ADMIN]), async (req, res, next) => {
  try {
    const { name, capacity, amenities, imageUrl } = req.body as {
      name?: string;
      capacity?: number | string;
      amenities?: string[];
      imageUrl?: string | null;
    };

    if (!name || !capacity) {
      throw new HttpError(400, 'Name and capacity are required');
    }

    const room = await prisma.room.create({
      data: {
        name,
        capacity: Number(capacity),
        amenities: JSON.stringify(amenities || []),
        imageUrl: imageUrl || null,
      },
    });

    return res.status(201).json(serializeRoom(room));
  } catch (err) {
    return next(err);
  }
});
