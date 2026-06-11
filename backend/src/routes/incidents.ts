import { Router } from 'express';
import { IncidentController } from '../controllers/incidentController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
const controller = new IncidentController();

router.use(authenticate);
router.get('/', controller.getAll);
router.get('/stats', controller.getStats);
router.get('/:id', controller.getById);
router.put('/:id', requireAdmin, controller.update);
router.post('/:id/timeline', requireAdmin, controller.addTimeline);

export default router;
