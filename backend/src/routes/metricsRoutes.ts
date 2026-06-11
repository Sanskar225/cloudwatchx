import { Router } from 'express';
import { MetricsController } from '../controllers/metricsController';
import { authenticate } from '../middleware/auth';

const router = Router();
const controller = new MetricsController();

router.use(authenticate);
router.get('/overview', controller.getOverview);
router.get('/server/:serverId', controller.getServerMetrics);
router.get('/server/:serverId/history', controller.getHistory);

export default router;
