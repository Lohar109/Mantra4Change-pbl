import type { Request, Response } from 'express';
import { getAllGrants, getGrantReport, getGrantMonths } from '../services/grant.service';
import { generateGrantNarrative } from '../services/ai.service';

export function listGrants(req: Request, res: Response): void {
  try {
    const grants = getAllGrants();
    res.json(grants);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch grants', details: String(err) });
  }
}

export function grantReport(req: Request, res: Response): void {
  try {
    const { grantId } = req.params;
    const { month } = req.query as { month?: string };
    const report = getGrantReport(grantId, month);
    if (!report) {
      res.status(404).json({ error: `Grant ${grantId} not found` });
      return;
    }
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch grant report', details: String(err) });
  }
}

export function grantMonths(req: Request, res: Response): void {
  try {
    const { grantId } = req.params;
    const months = getGrantMonths(grantId);
    res.json(months);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch grant months', details: String(err) });
  }
}

export async function generateNarrative(req: Request, res: Response): Promise<void> {
  try {
    const { grantId, month, facts } = req.body as {
      grantId: string;
      month: string;
      facts: Record<string, unknown>;
    };

    if (!grantId || !month) {
      res.status(400).json({ error: 'grantId and month are required' });
      return;
    }

    const report = getGrantReport(grantId, month);
    if (!report) {
      res.status(404).json({ error: `Grant ${grantId} not found` });
      return;
    }

    const result = await generateGrantNarrative(grantId, month, facts ?? {}, report);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate narrative', details: String(err) });
  }
}
