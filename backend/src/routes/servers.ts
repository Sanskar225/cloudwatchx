import { Router } from 'express';
import { ServerController } from '../controllers/serverController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
const controller = new ServerController();

router.use(authenticate);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.get('/:id/metrics', controller.getMetrics);
router.post('/', requireAdmin, controller.create);
router.put('/:id', requireAdmin, controller.update);
router.delete('/:id', requireAdmin, controller.delete);

export default router;
