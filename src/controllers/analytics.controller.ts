import {Request, Response} from 'express';
import {prisma} from "../lib/prisma";

export const getAnalytics = async (_req: Request, res: Response) => {
    try {
        const totalBookings = await prisma.booking.count();
        const totalRooms = await prisma.room.count();
        const totalUsers = await prisma.user.count();

        // Get bookings per room
        const roomsWithBookings = await prisma.room.findMany({
            include: {
                _count: {
                    select: { bookings: true }
                }
            }
        });

        const bookingsPerRoom = roomsWithBookings.map(r => ({
            name: r.name,
            count: r._count.bookings
        }));

        res.json({
            totalBookings,
            totalRooms,
            totalUsers,
            bookingsPerRoom
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching analytics', err });
    }
};
