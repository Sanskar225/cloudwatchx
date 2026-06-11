import { Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { auditService } from '../services/auditService';
import { io } from '../index';

export class IncidentController {
  getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { status, severity, serverId, page = '1', limit = '20' } = req.query;
      const where: any = {};
      if (status) where.status = status;
      if (severity) where.severity = severity;
      if (serverId) where.serverId = serverId;

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      const [incidents, total] = await Promise.all([
        prisma.incident.findMany({
          where,
          include: {
            server: { select: { name: true, hostname: true } },
            assignedTo: { select: { name: true, email: true } },
            timeline: { orderBy: { createdAt: 'desc' }, take: 3 },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: parseInt(limit as string),
        }),
        prisma.incident.count({ where }),
      ]);

      res.json({ success: true, data: incidents, meta: { total, page: parseInt(page as string), limit: parseInt(limit as string) } });
    } catch (err) { next(err); }
  };

  getStats = async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const [open, investigating, resolved, bySeverity] = await Promise.all([
        prisma.incident.count({ where: { status: 'OPEN' } }),
        prisma.incident.count({ where: { status: 'INVESTIGATING' } }),
        prisma.incident.count({ where: { status: 'RESOLVED' } }),
        prisma.incident.groupBy({ by: ['severity'], _count: true }),
      ]);
      res.json({ success: true, data: { open, investigating, resolved, bySeverity } });
    } catch (err) { next(err); }
  };

  getById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const incident = await prisma.incident.findUnique({
        where: { id: req.params.id },
        include: {
          server: true,
          assignedTo: { select: { id: true, name: true, email: true } },
          timeline: { orderBy: { createdAt: 'asc' } },
        },
      });
      res.json({ success: true, data: incident });
    } catch (err) { next(err); }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { status, assignedToId } = req.body;
      const updateData: any = { status, assignedToId };
      if (status === 'RESOLVED') updateData.resolvedAt = new Date();

      const incident = await prisma.incident.update({
        where: { id: req.params.id },
        data: updateData,
        include: { server: true },
      });

      await auditService.log(req.user!.id, 'UPDATE_INCIDENT', 'Incident', incident.id, req.body);
      io.emit('incident:updated', incident);

      res.json({ success: true, data: incident });
    } catch (err) { next(err); }
  };

  addTimeline = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const entry = await prisma.incidentTimeline.create({
        data: { incidentId: req.params.id, message: req.body.message },
      });
      res.json({ success: true, data: entry });
    } catch (err) { next(err); }
  };
}
