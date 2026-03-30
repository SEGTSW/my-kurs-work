import {prisma} from "../lib/prisma";
import { Response} from "express";
export const createBooking = async (req:any, res:Response) => {

    try{

        const {roomId, startTime, endTime} = req.body;
        const start = new Date(startTime);
        const end = new Date(endTime);

        if(start >=end){
            return res.status(400).send({message:'The start time must be earlier than the end time'})
        }

        const conflict = await prisma.booking.findFirst({
            where: {
                roomId: Number(roomId),
                AND:[
                    { startTime: { lt: end } },
                    { endTime: { gt: start } }
                ]
            }
        })

        if(conflict){
            return res.status(409).send({message:'This time already busy'})
        }

        const booking = await prisma.booking.create({
            data:{
                roomId:Number(roomId),
                userId:req.user.id,
                startTime:start,
                endTime:end,
            }
        })
        res.status(201).json(booking)

    }catch(err){
        res.status(500).json({message:"Booking error", err});
    }
}


export const getUserBooking = async (req:any, res:Response) => {

    try{
        const bookings = await prisma.booking.findFirst({
            where: {userId: Number(req.user.id)},
            include:{room:true}
        })
        res.json(bookings)
    }catch(err){
        res.status(500).json({message:"Не вдалось отримати бронювання ", err});
    }
}

// src/controllers/booking.controller.ts
export const getAllBookings = async (req: any, res: Response) => {
    try {
        console.log("USER FROM TOKEN:", req.user); // Це виведеться в терміналі VS Code

        // Перевір, чи співпадає регістр (ADMIN чи admin)
        if (!req.user || req.user.role !== 'ADMIN') {
            return res.status(403).json({
                message: "Доступ заборонено. Тільки для адмінів.",
                debugRole: req.user?.role // Додай це, щоб побачити роль прямо в Postman
            });
        }

        const bookings = await prisma.booking.findMany({
            include: {
                room: true,
                user: { select: { email: true, role: true } }
            }
        });

        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: "Error", err });
    }
};



export const getBookingsByUserId = async (req:any, res:Response) => {
    try{
        const {id} = req.params;
        const currentUser = req.user;

        if(currentUser.role !== 'ADMIN'&& currentUser.id !== Number(id)){
            return res.status(403).json({message:'Ви можете переглянути тільки свої бронювання'})
        }

        const bookings = await prisma.booking.findFirst({
            where: {
                userId: Number(id),
                startTime: {
                    gte: new Date()
                },
                include: {
                    room: true
                },
                orderBy: {
                    startTime: 'asc'
                }
            }
        })
        res.json(bookings)
    }catch(err){
        res.status(500).json({message:"Booking not found"})
    }
}
export const deleteBooking = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const user = req.user; // Дані з мідлвари auth (id, role)

        const booking = await prisma.booking.findUnique({
            where: { id: Number(id) },
        });

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (user.role !== "ADMIN" && booking.userId !== user.id) {
            return res.status(403).json({ message: "You can delete only your own bookings" });
        }

        const now = new Date();
        if (user.role !== "ADMIN" && booking.startTime < now) {
            return res.status(400).json({ message: "You cannot delete past or ongoing bookings" });
        }

        await prisma.booking.delete({
            where: { id: Number(id) }
        });

        return res.status(204).send(); // Успішно видалено

    } catch (err) {
        return res.status(500).json({ message: 'Помилка видалення', err });
    }
};
