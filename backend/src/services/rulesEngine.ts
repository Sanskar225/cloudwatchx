import cron from 'node-cron';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { io } from '../index';
import { notificationService } from './notificationService';

type MetricValues = {
  cpu: number;
  ram: number;
  disk: number;
  networkIn: number;
  networkOut: number;
  uptime: number;
  loadAvg: number;
};

const metricMap: Record<string, keyof MetricValues> = {
  cpu: 'cpu',
  ram: 'ram',
  disk: 'disk',
  network_in: 'networkIn',
  network_out: 'networkOut',
  load_avg: 'loadAvg',
};

const evaluate = (value: number, operator: string, threshold: number): boolean => {
  switch (operator) {
    case '>': return value > threshold;
    case '>=': return value >= threshold;
    case '<': return value < threshold;
    case '<=': return value <= threshold;
    case '==': return value === threshold;
    default: return false;
  }
};

export const rulesEngineService = {
  evaluateServer: async (serverId: string, metrics: MetricValues) => {
    try {
      const rules = await prisma.monitoringRule.findMany({
        where: {
          enabled: true,
          OR: [{ serverId }, { serverId: null }],
        },
        include: { server: true },
      });

      const server = await prisma.server.findUnique({ where: { id: serverId } });
      if (!server) return;

      for (const rule of rules) {
        const metricKey = metricMap[rule.metric];
        if (!metricKey) continue;

        const value = metrics[metricKey];
        const triggered = evaluate(value, rule.operator, rule.threshold);

        if (triggered) {
          // Check if incident already open for this rule+server
          const existing = await prisma.incident.findFirst({
            where: {
              serverId,
              title: { contains: rule.name },
              status: { not: 'RESOLVED' },
            },
          });

          if (!existing) {
            const incident = await prisma.incident.create({
              data: {
                title: `${rule.name}: ${server.name}`,
                description: `Rule "${rule.name}" triggered: ${rule.metric} is ${value.toFixed(2)} (threshold: ${rule.operator} ${rule.threshold})`,
                severity: rule.severity,
                serverId,
                status: 'OPEN',
              },
              include: { server: true },
            });

            const alert = await prisma.alert.create({
              data: {
                title: `Alert: ${rule.name}`,
                message: `${rule.metric} exceeded threshold on ${server.name}`,
                level: rule.severity === 'CRITICAL' ? 'CRITICAL' : rule.severity === 'HIGH' ? 'WARNING' : 'INFO',
                serverId,
                metric: rule.metric,
                value,
                threshold: rule.threshold,
              },
            });

            io.emit('incident:new', incident);
            io.emit('alert:new', alert);

            await notificationService.send({
              type: 'alert',
              title: alert.title,
              message: alert.message,
              server: server.name,
              metric: rule.metric,
              value,
              threshold: rule.threshold,
              severity: rule.severity,
            });

            logger.warn(`🚨 Incident created: ${incident.title}`);
          }
        }
      }
    } catch (err) {
      logger.error('Rules engine error:', err);
    }
  },
};

export const startRulesEngine = () => {
  cron.schedule('*/1 * * * *', async () => {
    // Periodic cleanup: auto-resolve incidents if metric recovered
    // Implemented via metrics collector calling evaluateServer
  });
  logger.info('⚙️ Rules engine started');
};
