import { prisma } from '../config/database';
import { logger } from '../utils/logger';

export const auditService = {
  log: async (
    userId: string | null,
    action: string,
    resource: string,
    resourceId: string,
    details: Record<string, any>,
    ipAddress?: string
  ) => {
    try {
      await prisma.auditLog.create({
        data: { userId, action, resource, resourceId, details, ipAddress },
      });
    } catch (err) {
      logger.error('Audit log failed:', err);
    }
  },
};
