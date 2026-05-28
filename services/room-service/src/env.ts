import 'dotenv/config';

export const env = {
  port: Number(process.env.ROOM_SERVICE_PORT || 4002),
  jwtSecret: process.env.JWT_SECRET || 'your_secret_key',
};
