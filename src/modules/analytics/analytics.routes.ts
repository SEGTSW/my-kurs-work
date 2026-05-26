import { Role } from '@prisma/client';
import { Router } from 'express';

import { auth, authorize } from '../../middlewares/auth.middleware';
import { analyticsController } from './analytics.controller';

export const analyticsRoutes = Router();

analyticsRoutes.get('/', auth, authorize([Role.ADMIN]), analyticsController.getAnalytics);
