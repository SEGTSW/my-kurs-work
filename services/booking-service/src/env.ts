import 'dotenv/config';

export const env = {
  port: Number(process.env.BOOKING_SERVICE_PORT || 4003),
  jwtSecret: process.env.JWT_SECRET || 'your_secret_key',
};
