import { Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { auditService } from '../services/auditService';

export class ServerController {
  getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { group, tag, status } = req.query;
      const where: any = {};
      if (group) where.group = group;
      if (status) where.status = status;
      if (tag) where.tags = { has: tag as string };

      const servers = await prisma.server.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { incidents: { where: { status: { not: 'RESOLVED' } } } } },
        },
      });
      res.json({ success: true, data: servers });
    } catch (err) { next(err); }
  };

  getById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const server = await prisma.server.findUnique({
        where: { id: req.params.id },
        include: {
          incidents: { where: { status: { not: 'RESOLVED' } }, take: 5, orderBy: { createdAt: 'desc' } },
          metricSnapshots: { orderBy: { timestamp: 'desc' }, take: 1 },
        },
      });
      if (!server) throw new AppError('Server not found', 404);
      res.json({ success: true, data: server });
    } catch (err) { next(err); }
  };

  getMetrics = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { from, to } = req.query;
      const metrics = await prisma.metricSnapshot.findMany({
        where: {
          serverId: req.params.id,
          timestamp: {
            gte: from ? new Date(from as string) : new Date(Date.now() - 3600 * 1000),
            lte: to ? new Date(to as string) : new Date(),
          },
        },
        orderBy: { timestamp: 'asc' },
      });
      res.json({ success: true, data: metrics });
    } catch (err) { next(err); }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { name, hostname, ipAddress, port, tags, group } = req.body;
      if (!name || !hostname || !ipAddress) throw new AppError('Name, hostname, and IP required', 400);

      const server = await prisma.server.create({
        data: { name, hostname, ipAddress, port: port || 9100, tags: tags || [], group },
      });
      await auditService.log(req.user!.id, 'CREATE_SERVER', 'Server', server.id, { name });
      res.status(201).json({ success: true, data: server });
    } catch (err) { next(err); }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const server = await prisma.server.update({
        where: { id: req.params.id },
        data: req.body,
      });
      await auditService.log(req.user!.id, 'UPDATE_SERVER', 'Server', server.id, req.body);
      res.json({ success: true, data: server });
    } catch (err) { next(err); }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await prisma.server.delete({ where: { id: req.params.id } });
      await auditService.log(req.user!.id, 'DELETE_SERVER', 'Server', req.params.id, {});
      res.json({ success: true });
    } catch (err) { next(err); }
  };
}
