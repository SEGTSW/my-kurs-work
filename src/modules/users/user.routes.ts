import { Role } from '@prisma/client';
import { Router } from 'express';

import { auth, authorize } from '../../middlewares/auth.middleware';
import { userController } from './user.controller';

export const userRoutes = Router();

userRoutes.get('/', auth, authorize([Role.ADMIN]), userController.getAllUsers);
userRoutes.patch('/:id/role', auth, authorize([Role.ADMIN]), userController.makeAdmin);
userRoutes.get('/:id/bookings', auth, userController.getBookingsByUserId);
