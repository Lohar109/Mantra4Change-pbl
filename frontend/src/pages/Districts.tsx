import { useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Badge } from '../components/ui/Badge';
import { PageSpinner } from '../components/ui/Spinner';
import { usePBLDistricts, usePBLFilters } from '../hooks/usePBLData';
import { formatPct } from '../utils/risk.utils';
import { MONTHS } from '../constants';
import type { DistrictSummary } from '../types/pbl.types';

export function Districts() {
  const [month, setMonth] = useState('September 2025');
  const { data: districts, loading } = usePBLDistricts({ month });
  const { data: filters } = usePBLFilters();

  const sorted = [...districts].sort((a, b) => b.attendanceRate - a.attendanceRate);
  const top5 = new Set(sorted.slice(0, 5).map((_d, i) => i));
  const bottom5 = new Set(sorted.slice(-5).map((_d, i) => sorted.length - 5 + i));

  function rowClass(idx: number, d: DistrictSummary): string {
    if (d.riskStatus === 'Critical') return 'bg-red-50';
    if (top5.has(idx)) return 'bg-green-50';
    if (bottom5.has(idx)) return 'bg-red-50/40';
    return '';
  }

  return (
    <PageWrapper
      title="District & Block Overview"
      subtitle="Attendance, participation, and risk status across all locations"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <select
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            value={month}
            onChange={e => setMonth(e.target.value)}
          >
            {(filters.months.length ? filters.months : MONTHS).map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <div className="flex items-center gap-3 text-xs text-gray-500 ml-auto flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-green-100 rounded-sm inline-block" /> Top 5 performers
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-red-50 rounded-sm inline-block" /> Bottom 5 / Critical
            </span>
          </div>
        </div>

        {loading ? (
          <PageSpinner />
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['District', 'Block', 'Total Schools', 'Participating', 'Participation %', 'Evidence %', 'Attendance %', 'Risk Status'].map(h => (
                      <th key={h} className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${['Total Schools', 'Participating', 'Participation %', 'Evidence %', 'Attendance %'].includes(h) ? 'text-right' : 'text-left'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sorted.map((d, idx) => (
                    <tr key={idx} className={`hover:bg-gray-50/50 transition-colors ${rowClass(idx, d)}`}>
                      <td className="px-4 py-3 font-medium text-gray-900">{d.district}</td>
                      <td className="px-4 py-3 text-gray-600">{d.block}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{d.totalSchools}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{d.participatingSchools}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">{formatPct(d.participationRate)}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">{formatPct(d.evidenceRate)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatPct(d.attendanceRate)}</td>
                      <td className="px-4 py-3">
                        <Badge label={d.riskStatus} variant="risk" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
              {districts.length} district-block combinations shown for {month}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
