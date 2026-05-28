import express from 'express';

import { bookingRoutes } from './booking.routes';
import { errorHandler } from './error.middleware';
import { userBookingRoutes } from './user-booking.routes';

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'booking-service' });
  });

  app.use('/api/bookings', bookingRoutes);
  app.use('/api/users', userBookingRoutes);
  app.use(errorHandler);

  return app;
}
