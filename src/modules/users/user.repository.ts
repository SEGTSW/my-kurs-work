import { prisma } from '../../lib/prisma';

export const userRepository = {
  findAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
      },
      orderBy: { id: 'asc' },
    });
  },

  makeAdmin(id: number) {
    return prisma.user.update({
      where: { id },
      data: { role: 'ADMIN' },
      select: { id: true, email: true, role: true },
    });
  },
};
