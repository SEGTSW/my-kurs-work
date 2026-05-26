import {Request, Response} from 'express';
import {prisma} from "../lib/prisma";

export const getRooms = async (_req: Request, res: Response) => {
    try {
        const rooms = await prisma.room.findMany({ orderBy: { id: 'asc' } });
        const parsedRooms = rooms.map(r => ({
            ...r,
            amenities: r.amenities ? JSON.parse(r.amenities) : []
        }));
        res.json(parsedRooms);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching rooms', err });
    }
};

export const createRoom = async (req: Request, res: Response) => {
    try {
        const {name, capacity, amenities, imageUrl} = req.body;
        const room = await prisma.room.create({
            data: {
                name, 
                capacity: Number(capacity),
                amenities: amenities ? JSON.stringify(amenities) : "[]",
                imageUrl: imageUrl || null
            },
        });
        res.status(201).json({
            ...room,
            amenities: JSON.parse(room.amenities)
        });
    } catch (err) {
        res.status(500).send({message: 'Error creating room', err});
    }
}

export const AvailableRooms = async (req: Request, res: Response) => {
    try {
        const {startTime, endTime} = req.query;

        if(!startTime || !endTime){
            res.status(400).send({message: 'Invalid startTime format'});
        }

        const start = new Date(startTime as string);
        const end = new Date(endTime as string);

        const rooms = await prisma.room.findMany({
            where: {
                bookings: {
                    none: {
                        AND: [
                            { startTime: { lt: end } },
                            { endTime: { gt: start } },
                        ],
                    },
                },
            }
        })
        const parsedRooms = rooms.map(r => ({
            ...r,
            amenities: r.amenities ? JSON.parse(r.amenities) : []
        }));
        res.json(parsedRooms);
    } catch(err) {
        res.status(500).json({message: 'Error fetching available rooms', err});
    }
}
