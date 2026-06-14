import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { jwtConfig } from '../config/jwt';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { auditService } from '../services/auditService';

export class AuthController {
  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) throw new AppError('Email and password required', 400);

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) throw new AppError('Invalid credentials', 401);

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new AppError('Invalid credentials', 401);

      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        jwtConfig.secret,
        { expiresIn: '15m' }
      );
      const refreshToken = jwt.sign(
        { id: user.id },
        jwtConfig.refreshSecret,
        { expiresIn: '7d' }
      );

      await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });
      await auditService.log(user.id, 'LOGIN', 'User', user.id, {}, req.ip);

      res.json({
        success: true,
        data: {
          accessToken,
          refreshToken,
          user: { id: user.id, name: user.name, email: user.email, role: user.role },
        },
      });
    } catch (err) { next(err); }
  };

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, name, password, role } = req.body;
      if (!email || !name || !password) throw new AppError('All fields required', 400);

      const exists = await prisma.user.findUnique({ where: { email } });
      if (exists) throw new AppError('Email already in use', 409);

      const hashed = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: { email, name, password: hashed, role: role || 'VIEWER' },
        select: { id: true, name: true, email: true, role: true },
      });

      res.status(201).json({ success: true, data: user });
    } catch (err) { next(err); }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw new AppError('Refresh token required', 401);

      const decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret) as { id: string };
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user || user.refreshToken !== refreshToken) throw new AppError('Invalid refresh token', 401);

      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        jwtConfig.secret,
        { expiresIn: '15m' }
      );

      res.json({ success: true, data: { accessToken } });
    } catch (err) { next(err); }
  };

  logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await prisma.user.update({ where: { id: req.user!.id }, data: { refreshToken: null } });
      res.json({ success: true });
    } catch (err) { next(err); }
  };

  me = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      });
      res.json({ success: true, data: user });
    } catch (err) { next(err); }
  };
}