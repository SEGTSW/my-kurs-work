import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT || 3001),
  jwtSecret: process.env.JWT_SECRET || 'your_secret_key',
  corsOrigins: ['http://localhost:5173', 'http://127.0.0.1:5173'],
};
