import type { Request, Response } from 'express';
import {
  getPBLSummary,
  getDistrictBreakdown,
  getMonthlyComparison,
  getAvailableFilters,
} from '../services/pbl.service';

export function summary(req: Request, res: Response): void {
  try {
    const { month, district, block, subject } = req.query as Record<string, string | undefined>;
    const data = getPBLSummary(month, district, block, subject);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch PBL summary', details: String(err) });
  }
}

export function districts(req: Request, res: Response): void {
  try {
    const { month, district } = req.query as Record<string, string | undefined>;
    const data = getDistrictBreakdown(month, district);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch district data', details: String(err) });
  }
}

export function months(req: Request, res: Response): void {
  try {
    const data = getMonthlyComparison();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch monthly data', details: String(err) });
  }
}

export function filters(req: Request, res: Response): void {
  try {
    const data = getAvailableFilters();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch filters', details: String(err) });
  }
}
