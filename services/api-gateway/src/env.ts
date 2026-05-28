import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT || 3001),
  corsOrigins: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  services: {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
    rooms: process.env.ROOM_SERVICE_URL || 'http://localhost:4002',
    bookings: process.env.BOOKING_SERVICE_URL || 'http://localhost:4003',
  },
};
