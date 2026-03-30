import {Request, Response} from 'express';
import {prisma} from "../lib/prisma";

export const createRoom = async (req: Request, res: Response) => {

    try {

        const {name, capacity} = req.body;
        const room = await prisma.room.create({
            data: {name, capacity: Number(capacity)},
        });
        res.status(201).json(room);

    } catch (err) {
        res.status(500).send({message: 'Error creating room', err}, );
    }
}
    export const AvailableRooms = async (req: Request, res: Response) => {
        try{
            const {startTime, endTime} = req.query;

            if(!startTime || !endTime){
                res.status(400).send({message: 'Invalid startTime format'});
            }

            const start = new Date(startTime as string);
            const end = new Date(endTime as string);

            const rooms = await prisma.room.findMany({
                where: {
                    bookings:{
                        none:{
                            AND:[
                                {startTime:{lt:end}},
                                {endTime:{lt:start}},
                            ]
                        }
                    }
                }
            })
            res.json(rooms);
        }catch(err){
            res.status(500).json({message: 'Error fetching available rooms', err});
        }
    }
