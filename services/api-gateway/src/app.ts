import cors from 'cors';
import express from 'express';

import { env } from './env';
import { proxy } from './proxy';

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.corsOrigins }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'api-gateway',
      upstreams: env.services,
    });
  });

  app.use('/api/auth', proxy(env.services.auth));
  app.use(/^\/api\/users\/[^/]+\/bookings/, proxy(env.services.bookings));
  app.use('/api/users', proxy(env.services.auth));
  app.use('/api/rooms', proxy(env.services.rooms));
  app.use('/api/analytics', proxy(env.services.rooms));
  app.use('/api/bookings', proxy(env.services.bookings));

  return app;
}
