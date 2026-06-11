import { Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import axios from 'axios';

export class DashboardController {
  getOverview = async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const [
        totalServers,
        healthyServers,
        criticalServers,
        activeIncidents,
        recentAlerts,
        recentIncidents,
      ] = await Promise.all([
        prisma.server.count(),
        prisma.server.count({ where: { status: 'HEALTHY' } }),
        prisma.server.count({ where: { status: 'CRITICAL' } }),
        prisma.incident.count({ where: { status: { not: 'RESOLVED' } } }),
        prisma.alert.findMany({
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { server: { select: { name: true } } },
        }),
        prisma.incident.findMany({
          where: { status: { not: 'RESOLVED' } },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { server: { select: { name: true } } },
        }),
      ]);

      res.json({
        success: true,
        data: {
          stats: { totalServers, healthyServers, criticalServers, activeIncidents },
          recentAlerts,
          recentIncidents,
        },
      });
    } catch (err) { next(err); }
  };

  getServiceHealth = async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const services = [
        { name: 'Backend API', url: `http://localhost:${process.env.PORT || 4000}/health` },
        { name: 'Prometheus', url: `http://${process.env.PROMETHEUS_HOST || 'prometheus'}:9090/-/healthy` },
        { name: 'Grafana', url: `http://${process.env.GRAFANA_HOST || 'grafana'}:3001/api/health` },
        { name: 'Alertmanager', url: `http://${process.env.ALERTMANAGER_HOST || 'alertmanager'}:9093/-/healthy` },
      ];

      const results = await Promise.all(
        services.map(async (svc) => {
          try {
            await axios.get(svc.url, { timeout: 3000 });
            return { ...svc, status: 'HEALTHY' };
          } catch {
            return { ...svc, status: 'OFFLINE' };
          }
        })
      );

      // Check DB
      try {
        await prisma.$queryRaw`SELECT 1`;
        results.push({ name: 'Database', url: '', status: 'HEALTHY' });
      } catch {
        results.push({ name: 'Database', url: '', status: 'OFFLINE' });
      }

      res.json({ success: true, data: results });
    } catch (err) { next(err); }
  };
}
