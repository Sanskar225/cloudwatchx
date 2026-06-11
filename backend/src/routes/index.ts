import { Express } from 'express';
import authRouter from './auth';
import serverRouter from './servers';
import incidentRouter from './incidents';
import alertRouter from './alerts';
import rulesRouter from './rules';
import metricsRouter from './metricsRoutes';
import auditRouter from './audit';
import dashboardRouter from './dashboard';
import usersRouter from './users';

export const setupRoutes = (app: Express) => {
  app.use('/api/auth', authRouter);
  app.use('/api/servers', serverRouter);
  app.use('/api/incidents', incidentRouter);
  app.use('/api/alerts', alertRouter);
  app.use('/api/rules', rulesRouter);
  app.use('/api/metrics', metricsRouter);
  app.use('/api/audit', auditRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/users', usersRouter);
};
