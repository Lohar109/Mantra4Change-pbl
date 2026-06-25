export interface PBLRecord {
  reportingMonth: string;
  schoolName: string;
  schoolCode: string;
  district: string;
  block: string;
  pblConducted: string;
  evidenceSubmitted: string;
  classes: string;
  subject: string;
  enrollmentClass6: number;
  attendanceClass6Science: number;
  attendanceClass6Math: number;
  enrollmentClass7: number;
  attendanceClass7Science: number;
  attendanceClass7Math: number;
  enrollmentClass8: number;
  attendanceClass8Science: number;
  attendanceClass8Math: number;
  totalEnrollment: number;
  totalAttendance: number;
  attendanceRate: number;
  riskStatus: string;
}

export interface PBLSummary {
  totalSchools: number;
  participatingSchools: number;
  participationRate: number;
  evidenceRate: number;
  totalEnrollment: number;
  totalAttendance: number;
  attendanceRate: number;
  momParticipation: number | null;
  momAttendance: number | null;
}

export interface DistrictSummary {
  district: string;
  block: string;
  totalSchools: number;
  participatingSchools: number;
  participationRate: number;
  evidenceRate: number;
  attendanceRate: number;
  riskStatus: string;
}

export interface MonthlyComparison {
  month: string;
  participationRate: number;
  evidenceRate: number;
  attendanceRate: number;
  totalSchools: number;
  participatingSchools: number;
}

export interface RiskDistribution {
  onTrack: number;
  behind: number;
  atRisk: number;
  critical: number;
}
