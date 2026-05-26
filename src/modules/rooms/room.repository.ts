import { prisma } from '../../lib/prisma';

export const roomRepository = {
  findAll() {
    return prisma.room.findMany({ orderBy: { id: 'asc' } });
  },

  findAvailable(start: Date, end: Date) {
    return prisma.room.findMany({
      where: {
        bookings: {
          none: {
            AND: [
              { startTime: { lt: end } },
              { endTime: { gt: start } },
            ],
          },
        },
      },
      orderBy: { id: 'asc' },
    });
  },

  create(data: {
    name: string;
    capacity: number;
    amenities: string;
    imageUrl: string | null;
  }) {
    return prisma.room.create({ data });
  },
};
