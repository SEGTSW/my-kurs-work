import express from 'express';

import { authRoutes } from './auth.routes';
import { errorHandler } from './error.middleware';
import { userRoutes } from './user.routes';

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'auth-service' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use(errorHandler);

  return app;
}
