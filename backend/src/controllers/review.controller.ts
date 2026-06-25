import type { Request, Response } from 'express';
import { generateReviewSummary } from '../services/risk.service';

export function reviewSummary(req: Request, res: Response): void {
  try {
    const { month } = req.query as { month?: string };
    const targetMonth = month ?? 'September 2025';
    const summary = generateReviewSummary(targetMonth);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate review summary', details: String(err) });
  }
}
