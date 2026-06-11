import { Router } from 'express';
import { RulesController } from '../controllers/rulesController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
const controller = new RulesController();

router.use(authenticate);
router.get('/', controller.getAll);
router.post('/', requireAdmin, controller.create);
router.put('/:id', requireAdmin, controller.update);
router.delete('/:id', requireAdmin, controller.delete);

export default router;
