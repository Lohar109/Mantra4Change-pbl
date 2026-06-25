export function classifyRisk(rate: number): string {
  if (rate >= 0.75) return 'On Track';
  if (rate >= 0.60) return 'Behind';
  if (rate >= 0.35) return 'At Risk';
  return 'Critical';
}

export function getRiskColor(riskStatus: string): string {
  switch (riskStatus) {
    case 'On Track': return 'green';
    case 'Behind': return 'yellow';
    case 'At Risk': return 'orange';
    case 'Critical': return 'red';
    default: return 'gray';
  }
}

export function getRiskScore(riskStatus: string): number {
  switch (riskStatus) {
    case 'Critical': return 1;
    case 'At Risk': return 2;
    case 'Behind': return 3;
    case 'On Track': return 4;
    default: return 0;
  }
}

export function aggregateRiskStatus(rates: number[]): string {
  if (rates.length === 0) return 'At Risk';
  const avg = rates.reduce((sum, r) => sum + r, 0) / rates.length;
  return classifyRisk(avg);
}
