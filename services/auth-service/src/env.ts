import 'dotenv/config';

export const env = {
  port: Number(process.env.AUTH_SERVICE_PORT || 4001),
  jwtSecret: process.env.JWT_SECRET || 'your_secret_key',
};
