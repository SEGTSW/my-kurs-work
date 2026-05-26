import express from 'express';
import cors from 'cors';

import { env } from './config/env';
import { errorHandler } from './middlewares/error.middleware';
import { analyticsRoutes } from './modules/analytics/analytics.routes';
import { authRoutes } from './modules/auth/auth.routes';
import { bookingRoutes } from './modules/bookings/booking.routes';
import { roomRoutes } from './modules/rooms/room.routes';
import { userRoutes } from './modules/users/user.routes';

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.corsOrigins }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/rooms', roomRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/users', userRoutes);

  app.use(errorHandler);

  return app;
}
