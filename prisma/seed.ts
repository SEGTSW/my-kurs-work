import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  await prisma.booking.deleteMany();
  await prisma.room.deleteMany();

  const user2 = await prisma.user.upsert({
    where: { email: 'user1@example.com' },
    update: { password, role: 'USER' },
    create: { email: 'user1@example.com', password, role: 'USER' },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'user2@example.com' },
    update: { password, role: 'USER' },
    create: { email: 'user2@example.com', password, role: 'USER' },
  });

  const rooms = await Promise.all([
    prisma.room.create({ data: { name: 'Конференц-зал A', capacity: 20 } }),
    prisma.room.create({ data: { name: 'Переговорна B', capacity: 8 } }),
    prisma.room.create({ data: { name: 'Переговорна C', capacity: 6 } }),
    prisma.room.create({ data: { name: 'Open Space', capacity: 30 } }),
  ]);

  const admin = await prisma.user.upsert({
    where: { email: 'denderys32@gmail.com' },
    update: { password, role: 'ADMIN' },
    create: { email: 'denderys32@gmail.com', password, role: 'ADMIN' },
  });

  const bookings = [
    { roomId: rooms[0].id, userId: admin.id, start: '2026-05-26T09:00:00', end: '2026-05-26T11:00:00' },
    { roomId: rooms[0].id, userId: user2.id, start: '2026-05-26T14:00:00', end: '2026-05-26T16:00:00' },
    { roomId: rooms[1].id, userId: admin.id, start: '2026-05-27T10:00:00', end: '2026-05-27T12:00:00' },
    { roomId: rooms[1].id, userId: user3.id, start: '2026-05-28T09:00:00', end: '2026-05-28T10:30:00' },
    { roomId: rooms[2].id, userId: user2.id, start: '2026-05-29T11:00:00', end: '2026-05-29T13:00:00' },
    { roomId: rooms[2].id, userId: admin.id, start: '2026-06-02T15:00:00', end: '2026-06-02T17:00:00' },
    { roomId: rooms[3].id, userId: user3.id, start: '2026-06-03T09:00:00', end: '2026-06-03T12:00:00' },
    { roomId: rooms[3].id, userId: user2.id, start: '2026-06-04T13:00:00', end: '2026-06-04T15:00:00' },
  ];

  for (const b of bookings) {
    await prisma.booking.create({
      data: {
        roomId: b.roomId,
        userId: b.userId,
        startTime: new Date(b.start),
        endTime: new Date(b.end),
      },
    });
  }

  console.log('Seed done: 4 rooms, 8 bookings, 2 extra users');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
