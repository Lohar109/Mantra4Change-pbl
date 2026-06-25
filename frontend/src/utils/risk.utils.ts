import { RISK_BG_CLASSES, RISK_COLORS } from '../constants';

export function classifyRisk(rate: number): string {
  if (rate >= 0.75) return 'On Track';
  if (rate >= 0.60) return 'Behind';
  if (rate >= 0.35) return 'At Risk';
  return 'Critical';
}

export function getRiskBadgeClass(riskStatus: string): string {
  return RISK_BG_CLASSES[riskStatus] ?? 'bg-gray-100 text-gray-800';
}

export function getRiskColor(riskStatus: string): string {
  return RISK_COLORS[riskStatus] ?? '#6b7280';
}

export function formatPct(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

export function formatMoM(change: number | null): string {
  if (change === null) return '';
  const sign = change >= 0 ? '+' : '';
  return `${sign}${(change * 100).toFixed(1)}pp`;
}
