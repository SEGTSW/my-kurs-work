import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

import { env } from '../../config/env';
import { HttpError } from '../../shared/http-error';
import { authRepository } from './auth.repository';

export const authService = {
  async register(input: { email?: string; password?: string; role?: Role }) {
    if (!input.email || !input.password) {
      throw new HttpError(400, 'Email and password are required');
    }

    const existingUser = await authRepository.findUserByEmail(input.email);
    if (existingUser) {
      throw new HttpError(400, 'User already exists');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);
    const user = await authRepository.createUser({
      email: input.email,
      password: hashedPassword,
      role: input.role || Role.USER,
    });

    return { message: 'User created successfully', userId: user.id };
  },

  async login(input: { email?: string; password?: string }) {
    if (!input.email || !input.password) {
      throw new HttpError(400, 'Email and password are required');
    }

    const user = await authRepository.findUserByEmail(input.email);
    if (!user) {
      throw new HttpError(401, 'Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new HttpError(401, 'Invalid email or password');
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      env.jwtSecret,
      { expiresIn: '24h' },
    );

    return { token, role: user.role, email: user.email, id: user.id };
  },
};
