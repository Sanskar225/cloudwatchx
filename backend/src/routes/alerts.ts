import { Router } from 'express';
import { AlertController } from '../controllers/alertController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
const controller = new AlertController();

router.use(authenticate);
router.get('/', controller.getAll);
router.get('/stats', controller.getStats);
router.put('/:id/acknowledge', requireAdmin, controller.acknowledge);
router.put('/:id/resolve', requireAdmin, controller.resolve);

export default router;
