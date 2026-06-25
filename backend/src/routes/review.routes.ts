import { Router } from 'express';
import { reviewSummary } from '../controllers/review.controller';

const router = Router();

router.get('/summary', reviewSummary);

export default router;
