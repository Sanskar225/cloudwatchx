import { Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export class MetricsController {
  getOverview = async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const servers = await prisma.server.findMany({ select: { id: true, name: true, status: true } });
      const snapshots = await Promise.all(
        servers.map(async (s) => {
          const latest = await prisma.metricSnapshot.findFirst({
            where: { serverId: s.id },
            orderBy: { timestamp: 'desc' },
          });
          return { server: s, metrics: latest };
        })
      );
      res.json({ success: true, data: snapshots });
    } catch (err) { next(err); }
  };

  getServerMetrics = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const latest = await prisma.metricSnapshot.findFirst({
        where: { serverId: req.params.serverId },
        orderBy: { timestamp: 'desc' },
      });
      res.json({ success: true, data: latest });
    } catch (err) { next(err); }
  };

  getHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const hours = parseInt(req.query.hours as string) || 24;
      const history = await prisma.metricSnapshot.findMany({
        where: {
          serverId: req.params.serverId,
          timestamp: { gte: new Date(Date.now() - hours * 3600 * 1000) },
        },
        orderBy: { timestamp: 'asc' },
      });
      res.json({ success: true, data: history });
    } catch (err) { next(err); }
  };
}
