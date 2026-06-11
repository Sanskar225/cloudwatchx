import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';
import { AppError } from './errorHandler';
import { UserRole } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: UserRole };
}

export const authenticate = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new AppError('No token provided', 401, 'UNAUTHORIZED');

  try {
    const decoded = jwt.verify(token, jwtConfig.secret) as { id: string; email: string; role: UserRole };
    req.user = decoded;
    next();
  } catch {
    throw new AppError('Invalid or expired token', 401, 'INVALID_TOKEN');
  }
};

export const requireAdmin = (req: AuthRequest, _res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    throw new AppError('Admin access required', 403, 'FORBIDDEN');
  }
  next();
};
