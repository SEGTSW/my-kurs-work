import { Role } from '@prisma/client';
import { Router } from 'express';

import { auth, authorize } from './auth.middleware';
import { prisma } from './prisma';

export const userRoutes = Router();

userRoutes.get('/', auth, authorize([Role.ADMIN]), async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true },
      orderBy: { id: 'asc' },
    });

    return res.json(users);
  } catch (err) {
    return next(err);
  }
});

userRoutes.patch('/:id/role', auth, authorize([Role.ADMIN]), async (req, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: { role: Role.ADMIN },
      select: { id: true, email: true, role: true },
    });

    return res.json(user);
  } catch (err) {
    return next(err);
  }
});
