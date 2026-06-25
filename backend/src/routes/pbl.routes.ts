import { Router } from 'express';
import { summary, districts, months, filters } from '../controllers/pbl.controller';

const router = Router();

router.get('/summary', summary);
router.get('/districts', districts);
router.get('/months', months);
router.get('/filters', filters);

export default router;
