import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';

import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { setupRoutes } from './routes';
import { setupSocketHandlers } from './services/socketService';
import { startMetricsCollector } from './services/metricsCollector';
import { startRulesEngine } from './services/rulesEngine';
import { prisma } from './config/database';
import { redisClient } from './config/redis';
import { metricsMiddleware, metricsRouter } from './utils/metrics';

const app = express();
const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
app.use(metricsMiddleware);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Prometheus metrics
app.use('/metrics', metricsRouter);

// Health check
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    await redisClient.ping();
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: { database: 'up', redis: 'up' },
    });
  } catch (err) {
    res.status(503).json({ status: 'unhealthy', error: String(err) });
  }
});

// Routes
setupRoutes(app);

// Socket.IO
setupSocketHandlers(io);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected');

    await redisClient.ping();
    logger.info('✅ Redis connected');

    httpServer.listen(PORT, () => {
      logger.info(`🚀 CloudWatchX API running on port ${PORT}`);
    });

    // Start background services
    startMetricsCollector();
    startRulesEngine();
    logger.info('✅ Background services started');
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down...');
  await prisma.$disconnect();
  await redisClient.quit();
  process.exit(0);
});
