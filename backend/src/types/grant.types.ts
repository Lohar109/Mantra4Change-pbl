export interface GrantFinanceRecord {
  grantId: string;
  donor: string;
  grantName: string;
  periodStart: string;
  periodEnd: string;
  coveredDistricts: string;
  reportingMonth: string;
  budgetLine: string;
  approvedBudgetUnits: number;
  monthlyUtilizedUnits: number;
  cumulativeUtilizedUnits: number;
  cumulativeUtilizationRate: number;
  financeNote: string;
}

export interface GrantPerformanceRecord {
  grantId: string;
  donor: string;
  grantName: string;
  reportingMonth: string;
  pblCompletionRate: number;
  evidenceSubmissionRate: number;
  attendanceRate: number;
  riskStatus: string;
  milestoneSummary: string;
  draftReportText: string;
}

export interface GrantMediaRecord {
  recordId: string;
  recordType: string;
  grantId: string;
  reportingMonth: string;
  district: string;
  title: string;
  summaryOrCaption: string;
  fileName: string;
}

export interface GrantInfo {
  grantId: string;
  donor: string;
  grantName: string;
  periodStart: string;
  periodEnd: string;
  coveredDistricts: string;
}

export interface GrantReport {
  grantInfo: GrantInfo;
  financeData: GrantFinanceRecord[];
  performanceData: GrantPerformanceRecord | null;
  mediaAssets: GrantMediaRecord[];
  milestoneSummary: string;
}

export interface GenerateNarrativeRequest {
  grantId: string;
  month: string;
  facts: Record<string, unknown>;
}

export interface GenerateNarrativeResponse {
  narrative: string;
  factsUsed: Record<string, unknown>;
  generatedAt: string;
}
