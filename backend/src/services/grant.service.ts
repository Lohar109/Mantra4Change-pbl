import { readGrantFinanceFile, readGrantMediaFile, readGrantPerformanceFile } from '../utils/csvParser';
import type {
  GrantFinanceRecord,
  GrantInfo,
  GrantMediaRecord,
  GrantPerformanceRecord,
  GrantReport,
} from '../types/grant.types';

function mapFinance(raw: Record<string, unknown>): GrantFinanceRecord {
  return {
    grantId: String(raw['grant_id'] ?? ''),
    donor: String(raw['donor'] ?? ''),
    grantName: String(raw['grant_name'] ?? ''),
    periodStart: String(raw['period_start'] ?? ''),
    periodEnd: String(raw['period_end'] ?? ''),
    coveredDistricts: String(raw['covered_districts'] ?? ''),
    reportingMonth: String(raw['reporting_month'] ?? ''),
    budgetLine: String(raw['budget_line'] ?? ''),
    approvedBudgetUnits: Number(raw['approved_budget_units'] ?? 0),
    monthlyUtilizedUnits: Number(raw['monthly_utilized_units'] ?? 0),
    cumulativeUtilizedUnits: Number(raw['cumulative_utilized_units'] ?? 0),
    cumulativeUtilizationRate: Number(raw['cumulative_utilization_rate'] ?? 0),
    financeNote: String(raw['finance_note'] ?? ''),
  };
}

function mapPerformance(raw: Record<string, unknown>): GrantPerformanceRecord {
  return {
    grantId: String(raw['grant_id'] ?? ''),
    donor: String(raw['donor'] ?? ''),
    grantName: String(raw['grant_name'] ?? ''),
    reportingMonth: String(raw['reporting_month'] ?? ''),
    pblCompletionRate: Number(raw['pbl_completion_rate'] ?? 0),
    evidenceSubmissionRate: Number(raw['evidence_submission_rate'] ?? 0),
    attendanceRate: Number(raw['attendance_rate'] ?? 0),
    riskStatus: String(raw['risk_status'] ?? ''),
    milestoneSummary: String(raw['milestone_summary'] ?? ''),
    draftReportText: String(raw['draft_report_text'] ?? ''),
  };
}

function mapMedia(raw: Record<string, unknown>): GrantMediaRecord {
  return {
    recordId: String(raw['record_id'] ?? ''),
    recordType: String(raw['record_type'] ?? ''),
    grantId: String(raw['grant_id'] ?? ''),
    reportingMonth: String(raw['reporting_month'] ?? ''),
    district: String(raw['district'] ?? ''),
    title: String(raw['title'] ?? ''),
    summaryOrCaption: String(raw['summary_or_caption'] ?? ''),
    fileName: String(raw['file_name'] ?? ''),
  };
}

export function getAllGrants(): GrantInfo[] {
  const raw = readGrantFinanceFile();
  const finance = raw.map(mapFinance);
  const seen = new Set<string>();
  const grants: GrantInfo[] = [];
  for (const r of finance) {
    if (!seen.has(r.grantId)) {
      seen.add(r.grantId);
      grants.push({
        grantId: r.grantId,
        donor: r.donor,
        grantName: r.grantName,
        periodStart: r.periodStart,
        periodEnd: r.periodEnd,
        coveredDistricts: r.coveredDistricts,
      });
    }
  }
  return grants;
}

export function getGrantReport(grantId: string, month?: string): GrantReport | null {
  const financeRaw = readGrantFinanceFile().map(mapFinance);
  const performanceRaw = readGrantPerformanceFile().map(mapPerformance);
  const mediaRaw = readGrantMediaFile().map(mapMedia);

  const financeForGrant = financeRaw.filter(r => r.grantId === grantId);
  if (financeForGrant.length === 0) return null;

  const first = financeForGrant[0];
  const grantInfo: GrantInfo = {
    grantId: first.grantId,
    donor: first.donor,
    grantName: first.grantName,
    periodStart: first.periodStart,
    periodEnd: first.periodEnd,
    coveredDistricts: first.coveredDistricts,
  };

  const financeData = month
    ? financeForGrant.filter(r => r.reportingMonth === month)
    : financeForGrant;

  const performanceData = performanceRaw.find(
    r => r.grantId === grantId && (!month || r.reportingMonth === month)
  ) ?? null;

  const mediaAssets = mediaRaw.filter(
    r => r.grantId === grantId && (!month || r.reportingMonth === month)
  );

  const milestoneSummary = performanceData?.milestoneSummary ?? 'No milestone data available';

  return { grantInfo, financeData, performanceData, mediaAssets, milestoneSummary };
}

export function getGrantMonths(grantId: string): string[] {
  const raw = readGrantFinanceFile().map(mapFinance);
  const months = raw
    .filter(r => r.grantId === grantId)
    .map(r => r.reportingMonth);
  return [...new Set(months)];
}
