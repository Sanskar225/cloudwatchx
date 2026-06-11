import { Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export class AlertController {
  getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { status, level } = req.query;
      const where: any = {};
      if (status) where.status = status;
      if (level) where.level = level;

      const alerts = await prisma.alert.findMany({
        where,
        include: { server: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
      res.json({ success: true, data: alerts });
    } catch (err) { next(err); }
  };

  getStats = async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const stats = await prisma.alert.groupBy({ by: ['level', 'status'], _count: true });
      res.json({ success: true, data: stats });
    } catch (err) { next(err); }
  };

  acknowledge = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const alert = await prisma.alert.update({
        where: { id: req.params.id },
        data: { status: 'ACKNOWLEDGED' },
      });
      res.json({ success: true, data: alert });
    } catch (err) { next(err); }
  };

  resolve = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const alert = await prisma.alert.update({
        where: { id: req.params.id },
        data: { status: 'RESOLVED' },
      });
      res.json({ success: true, data: alert });
    } catch (err) { next(err); }
  };
}
