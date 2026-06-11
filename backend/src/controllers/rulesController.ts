import { Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { auditService } from '../services/auditService';

export class RulesController {
  getAll = async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const rules = await prisma.monitoringRule.findMany({
        include: { server: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      });
      res.json({ success: true, data: rules });
    } catch (err) { next(err); }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const rule = await prisma.monitoringRule.create({ data: req.body });
      await auditService.log(req.user!.id, 'CREATE_RULE', 'MonitoringRule', rule.id, req.body);
      res.status(201).json({ success: true, data: rule });
    } catch (err) { next(err); }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const rule = await prisma.monitoringRule.update({
        where: { id: req.params.id },
        data: req.body,
      });
      await auditService.log(req.user!.id, 'UPDATE_RULE', 'MonitoringRule', rule.id, req.body);
      res.json({ success: true, data: rule });
    } catch (err) { next(err); }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await prisma.monitoringRule.delete({ where: { id: req.params.id } });
      await auditService.log(req.user!.id, 'DELETE_RULE', 'MonitoringRule', req.params.id, {});
      res.json({ success: true });
    } catch (err) { next(err); }
  };
}
