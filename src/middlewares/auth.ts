import {Request, Response, NextFunction} from 'express';
import jwt from "jsonwebtoken";
import {Role} from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';
// src/middlewares/auth.ts
export const auth = (req: any, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(' ')[1]; // Отримуємо сам токен після "Bearer"

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        req.user = decoded; // ТУТ МАЮТЬ БУТИ id ТА role
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

    export const authorize = (roles: Role[]) => {
    return (req: any, res: Response, next: NextFunction) => {
        if(!req.user || !roles.includes(req.user.role)) {
            return res.status(401).json({message: 'Forbidden: Access denied'});
        }
        next();
    }
}
