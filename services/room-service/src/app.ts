import express from 'express';

import { analyticsRoutes } from './analytics.routes';
import { errorHandler } from './error.middleware';
import { roomRoutes } from './room.routes';

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'room-service' });
  });

  app.use('/api/rooms', roomRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use(errorHandler);

  return app;
}
