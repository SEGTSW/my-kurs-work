import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

import { env } from './env';
import { HttpError } from './http-error';
import { prisma } from './prisma';

export const authRoutes = Router();

authRoutes.post('/register', async (req, res, next) => {
  try {
    const { email, password, role } = req.body as {
      email?: string;
      password?: string;
      role?: Role;
    };

    if (!email || !password) {
      throw new HttpError(400, 'Email and password are required');
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new HttpError(400, 'User already exists');
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: await bcrypt.hash(password, 10),
        role: role || Role.USER,
      },
    });

    return res.status(201).json({ message: 'User created successfully', userId: user.id });
  } catch (err) {
    return next(err);
  }
});

authRoutes.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      throw new HttpError(400, 'Email and password are required');
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new HttpError(401, 'Invalid email or password');
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      env.jwtSecret,
      { expiresIn: '24h' },
    );

    return res.json({ token, role: user.role, email: user.email, id: user.id });
  } catch (err) {
    return next(err);
  }
});
