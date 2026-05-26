import { Role } from '@prisma/client';
import { Router } from 'express';

import { auth, authorize } from '../../middlewares/auth.middleware';
import { roomController } from './room.controller';

export const roomRoutes = Router();

roomRoutes.get('/', auth, roomController.getRooms);
roomRoutes.get('/available', auth, roomController.getAvailableRooms);
roomRoutes.post('/', auth, authorize([Role.ADMIN]), roomController.createRoom);
