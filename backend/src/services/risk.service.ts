import { getDistrictBreakdown, getMonthlyComparison, getPBLSummary } from './pbl.service';
import { classifyRisk } from '../utils/riskEngine';

export interface ReviewSummary {
  month: string;
  achievements: string[];
  momChanges: { metric: string; change: number; direction: 'up' | 'down' | 'same' }[];
  risks: { district: string; block: string; riskStatus: string; attendanceRate: number }[];
  priorityDistricts: string[];
  discussionPoints: string[];
}

export function generateReviewSummary(month: string): ReviewSummary {
  const summary = getPBLSummary(month);
  const districts = getDistrictBreakdown(month);
  const monthly = getMonthlyComparison();

  const months = ['July 2025', 'August 2025', 'September 2025'];
  const idx = months.indexOf(month);
  const prevMonth = idx > 0 ? months[idx - 1] : null;
  const prevSummary = prevMonth ? getPBLSummary(prevMonth) : null;

  const achievements: string[] = [];
  achievements.push(
    `${summary.participatingSchools} out of ${summary.totalSchools} schools conducted PBL sessions (${(summary.participationRate * 100).toFixed(1)}%)`
  );
  achievements.push(
    `Overall attendance rate reached ${(summary.attendanceRate * 100).toFixed(1)}% with ${summary.totalAttendance.toLocaleString()} student-sessions recorded`
  );
  achievements.push(
    `Evidence submission rate: ${(summary.evidenceRate * 100).toFixed(1)}% of participating schools submitted documentation`
  );

  const onTrackDistricts = districts.filter(d => d.riskStatus === 'On Track');
  if (onTrackDistricts.length > 0) {
    achievements.push(
      `${onTrackDistricts.length} district-block combinations are "On Track" with attendance ≥75%`
    );
  }

  const momChanges: ReviewSummary['momChanges'] = [];
  if (prevSummary) {
    const partChange = summary.participationRate - prevSummary.participationRate;
    const attChange = summary.attendanceRate - prevSummary.attendanceRate;
    const evChange = summary.evidenceRate - prevSummary.evidenceRate;

    momChanges.push({
      metric: 'PBL Participation Rate',
      change: Math.abs(partChange),
      direction: partChange > 0.001 ? 'up' : partChange < -0.001 ? 'down' : 'same',
    });
    momChanges.push({
      metric: 'Attendance Rate',
      change: Math.abs(attChange),
      direction: attChange > 0.001 ? 'up' : attChange < -0.001 ? 'down' : 'same',
    });
    momChanges.push({
      metric: 'Evidence Submission Rate',
      change: Math.abs(evChange),
      direction: evChange > 0.001 ? 'up' : evChange < -0.001 ? 'down' : 'same',
    });
  }

  const risks = districts
    .filter(d => d.riskStatus === 'At Risk' || d.riskStatus === 'Critical')
    .map(d => ({
      district: d.district,
      block: d.block,
      riskStatus: d.riskStatus,
      attendanceRate: d.attendanceRate,
    }))
    .sort((a, b) => a.attendanceRate - b.attendanceRate);

  const priorityDistricts = [
    ...new Set([
      ...districts
        .filter(d => d.riskStatus === 'Critical' || d.riskStatus === 'At Risk')
        .map(d => d.district),
    ]),
  ].slice(0, 5);

  const discussionPoints: string[] = [
    `Review attendance intervention strategy for ${risks.length} at-risk/critical district-block combinations`,
    `Evidence documentation gap: ${(( 1 - summary.evidenceRate) * 100).toFixed(0)}% of schools have not submitted evidence — consider training support`,
    `Explore scaling best practices from top-performing districts to lagging areas`,
    `Discuss resource allocation adjustments for blocks with persistent below-60% attendance`,
  ];

  if (summary.momParticipation !== null && summary.momParticipation > 0) {
    discussionPoints.push(
      `Identify what drove the ${(summary.momParticipation * 100).toFixed(1)}pp participation improvement and replicate it`
    );
  }

  return {
    month,
    achievements,
    momChanges,
    risks,
    priorityDistricts,
    discussionPoints,
  };
}
