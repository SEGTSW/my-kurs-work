import {Request, Response} from 'express';
import {prisma} from "../lib/prisma";

export const getAllUsers = async (_req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true
            },
            orderBy: { id: 'asc' }
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching users', err });
    }
};

export const makeAdmin = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.update({
            where: { id: Number(id) },
            data: { role: 'ADMIN' },
            select: { id: true, email: true, role: true }
        });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Error updating user role', err });
    }
};
