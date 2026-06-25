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

export interface AvailableFilters {
  months: string[];
  districts: string[];
  blocks: string[];
  subjects: string[];
}
