import { Router } from 'express';
import { listGrants, grantReport, grantMonths, generateNarrative } from '../controllers/grant.controller';

const router = Router();

router.get('/', listGrants);
router.post('/generate-narrative', generateNarrative);
router.get('/:grantId/months', grantMonths);
router.get('/:grantId/report', grantReport);

export default router;
