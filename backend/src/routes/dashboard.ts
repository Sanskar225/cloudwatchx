import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController';
import { authenticate } from '../middleware/auth';

const router = Router();
const controller = new DashboardController();

router.use(authenticate);
router.get('/overview', controller.getOverview);
router.get('/service-health', controller.getServiceHealth);

export default router;
