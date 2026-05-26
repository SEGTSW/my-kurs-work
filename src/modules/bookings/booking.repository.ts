import { prisma } from '../../lib/prisma';

export const bookingRepository = {
  findConflict(roomId: number, startTime: Date, endTime: Date) {
    return prisma.booking.findFirst({
      where: {
        roomId,
        AND: [
          { startTime: { lt: endTime } },
          { endTime: { gt: startTime } },
        ],
      },
    });
  },

  create(data: {
    roomId: number;
    userId: number;
    startTime: Date;
    endTime: Date;
  }) {
    return prisma.booking.create({ data });
  },

  findByUser(userId: number) {
    return prisma.booking.findMany({
      where: { userId },
      include: { room: true },
      orderBy: { startTime: 'asc' },
    });
  },

  findAll() {
    return prisma.booking.findMany({
      include: {
        room: true,
        user: { select: { email: true, role: true } },
      },
      orderBy: { startTime: 'asc' },
    });
  },

  findUpcomingByUser(userId: number) {
    return prisma.booking.findMany({
      where: {
        userId,
        startTime: { gte: new Date() },
      },
      include: { room: true },
      orderBy: { startTime: 'asc' },
    });
  },

  findById(id: number) {
    return prisma.booking.findUnique({ where: { id } });
  },

  deleteById(id: number) {
    return prisma.booking.delete({ where: { id } });
  },
};
