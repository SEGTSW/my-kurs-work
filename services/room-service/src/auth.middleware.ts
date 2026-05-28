import { Role } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { env } from './env';

export type AuthenticatedRequest = Request & {
  user?: {
    id: number;
    role: Role;
  };
};

export function auth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : undefined;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    req.user = jwt.verify(token, env.jwtSecret) as { id: number; role: Role };
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

export function authorize(roles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Access denied' });
    }

    return next();
  };
}
