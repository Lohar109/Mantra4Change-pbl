import { readAllPBLFiles } from '../utils/csvParser';
import { classifyRisk } from '../utils/riskEngine';
import type { PBLRecord, PBLSummary, DistrictSummary, MonthlyComparison } from '../types/pbl.types';

function mapRecord(raw: Record<string, unknown>): PBLRecord {
  return {
    reportingMonth: String(raw['Reporting Month'] ?? ''),
    schoolName: String(raw['School Name'] ?? ''),
    schoolCode: String(raw['School Code'] ?? ''),
    district: String(raw['District'] ?? ''),
    block: String(raw['Block'] ?? ''),
    pblConducted: String(raw['PBL Conducted'] ?? ''),
    evidenceSubmitted: String(raw['Evidence Submitted'] ?? ''),
    classes: String(raw['Classes'] ?? ''),
    subject: String(raw['Subject'] ?? ''),
    enrollmentClass6: Number(raw['Enrollment Class 6'] ?? 0),
    attendanceClass6Science: Number(raw['Attendance Class 6 Science'] ?? 0),
    attendanceClass6Math: Number(raw['Attendance Class 6 Math'] ?? 0),
    enrollmentClass7: Number(raw['Enrollment Class 7'] ?? 0),
    attendanceClass7Science: Number(raw['Attendance Class 7 Science'] ?? 0),
    attendanceClass7Math: Number(raw['Attendance Class 7 Math'] ?? 0),
    enrollmentClass8: Number(raw['Enrollment Class 8'] ?? 0),
    attendanceClass8Science: Number(raw['Attendance Class 8 Science'] ?? 0),
    attendanceClass8Math: Number(raw['Attendance Class 8 Math'] ?? 0),
    totalEnrollment: Number(raw['Total Enrollment'] ?? 0),
    totalAttendance: Number(raw['Total Attendance'] ?? 0),
    attendanceRate: Number(raw['Attendance Rate'] ?? 0),
    riskStatus: String(raw['Risk Status'] ?? ''),
  };
}

function getAllRecords(): PBLRecord[] {
  const raw = readAllPBLFiles();
  return raw.map(mapRecord);
}

function filterRecords(
  records: PBLRecord[],
  month?: string,
  district?: string,
  block?: string,
  subject?: string
): PBLRecord[] {
  return records.filter(r => {
    if (month && r.reportingMonth !== month) return false;
    if (district && r.district !== district) return false;
    if (block && r.block !== block) return false;
    if (subject && r.subject !== subject) return false;
    return true;
  });
}

export function getPBLSummary(
  month?: string,
  district?: string,
  block?: string,
  subject?: string
): PBLSummary {
  const all = getAllRecords();
  const filtered = filterRecords(all, month, district, block, subject);

  const totalSchools = filtered.length;
  const participatingSchools = filtered.filter(r => r.pblConducted === 'Yes').length;
  const evidenceSchools = filtered.filter(r => r.evidenceSubmitted === 'Yes').length;
  const totalEnrollment = filtered.reduce((s, r) => s + r.totalEnrollment, 0);
  // totalAttendance per school is class×subject counts; use totalEnrollment as denominator proxy
  // Use pre-computed attendanceRate from CSV for accuracy (weighted by enrollment)
  const weightedAttendanceSum = filtered.reduce((s, r) => s + r.attendanceRate * r.totalEnrollment, 0);
  const totalAttendance = filtered.reduce((s, r) => s + r.totalAttendance, 0);

  const participationRate = totalSchools > 0 ? participatingSchools / totalSchools : 0;
  const evidenceRate = totalSchools > 0 ? evidenceSchools / totalSchools : 0;
  const attendanceRate = totalEnrollment > 0 ? weightedAttendanceSum / totalEnrollment : 0;

  let momParticipation: number | null = null;
  let momAttendance: number | null = null;

  const months = ['July 2025', 'August 2025', 'September 2025'];
  if (month) {
    const idx = months.indexOf(month);
    if (idx > 0) {
      const prevMonth = months[idx - 1];
      const prevFiltered = filterRecords(all, prevMonth, district, block, subject);
      const prevTotal = prevFiltered.length;
      const prevParticipating = prevFiltered.filter(r => r.pblConducted === 'Yes').length;
      const prevEnrollment = prevFiltered.reduce((s, r) => s + r.totalEnrollment, 0);
      const prevWeightedAtt = prevFiltered.reduce((s, r) => s + r.attendanceRate * r.totalEnrollment, 0);
      const prevParticipationRate = prevTotal > 0 ? prevParticipating / prevTotal : 0;
      const prevAttendanceRate = prevEnrollment > 0 ? prevWeightedAtt / prevEnrollment : 0;
      momParticipation = participationRate - prevParticipationRate;
      momAttendance = attendanceRate - prevAttendanceRate;
    }
  }

  return {
    totalSchools,
    participatingSchools,
    participationRate,
    evidenceRate,
    totalEnrollment,
    totalAttendance,
    attendanceRate,
    momParticipation,
    momAttendance,
  };
}

export function getDistrictBreakdown(
  month?: string,
  district?: string
): DistrictSummary[] {
  const all = getAllRecords();
  const filtered = filterRecords(all, month, district);

  const groups = new Map<string, PBLRecord[]>();
  for (const r of filtered) {
    const key = `${r.district}||${r.block}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }

  const result: DistrictSummary[] = [];
  for (const [key, records] of groups) {
    const [districtName, blockName] = key.split('||');
    const totalSchools = records.length;
    const participatingSchools = records.filter(r => r.pblConducted === 'Yes').length;
    const evidenceSchools = records.filter(r => r.evidenceSubmitted === 'Yes').length;
    const totalEnrollment = records.reduce((s, r) => s + r.totalEnrollment, 0);
    const weightedAttSum = records.reduce((s, r) => s + r.attendanceRate * r.totalEnrollment, 0);

    const participationRate = totalSchools > 0 ? participatingSchools / totalSchools : 0;
    const evidenceRate = totalSchools > 0 ? evidenceSchools / totalSchools : 0;
    const attendanceRate = totalEnrollment > 0 ? weightedAttSum / totalEnrollment : 0;
    const riskStatus = classifyRisk(attendanceRate);

    result.push({
      district: districtName,
      block: blockName,
      totalSchools,
      participatingSchools,
      participationRate,
      evidenceRate,
      attendanceRate,
      riskStatus,
    });
  }

  return result.sort((a, b) => {
    if (a.district < b.district) return -1;
    if (a.district > b.district) return 1;
    if (a.block < b.block) return -1;
    return 1;
  });
}

export function getMonthlyComparison(): MonthlyComparison[] {
  const months = ['July 2025', 'August 2025', 'September 2025'];
  const all = getAllRecords();

  return months.map(month => {
    const records = filterRecords(all, month);
    const totalSchools = records.length;
    const participatingSchools = records.filter(r => r.pblConducted === 'Yes').length;
    const evidenceSchools = records.filter(r => r.evidenceSubmitted === 'Yes').length;
    const totalEnrollment = records.reduce((s, r) => s + r.totalEnrollment, 0);
    const weightedAtt = records.reduce((s, r) => s + r.attendanceRate * r.totalEnrollment, 0);

    return {
      month,
      participationRate: totalSchools > 0 ? participatingSchools / totalSchools : 0,
      evidenceRate: totalSchools > 0 ? evidenceSchools / totalSchools : 0,
      attendanceRate: totalEnrollment > 0 ? weightedAtt / totalEnrollment : 0,
      totalSchools,
      participatingSchools,
    };
  });
}

export function getAvailableFilters(): { months: string[]; districts: string[]; blocks: string[]; subjects: string[] } {
  const all = getAllRecords();
  return {
    months: [...new Set(all.map(r => r.reportingMonth))].sort(),
    districts: [...new Set(all.map(r => r.district))].sort(),
    blocks: [...new Set(all.map(r => r.block))].sort(),
    subjects: [...new Set(all.map(r => r.subject))].sort(),
  };
}
