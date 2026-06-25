import { useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { FilterBar } from '../components/filters/FilterBar';
import { KPICard } from '../components/ui/Card';
import { PageSpinner } from '../components/ui/Spinner';
import { BarChart } from '../components/charts/BarChart';
import { PieChart } from '../components/charts/PieChart';
import { TrendArrow } from '../components/charts/TrendArrow';
import { usePBLSummary, usePBLDistricts, usePBLFilters } from '../hooks/usePBLData';
import { formatPct, getRiskColor } from '../utils/risk.utils';

export function Dashboard() {
  const [selected, setSelected] = useState({ month: 'September 2025', district: '', block: '', subject: '' });
  const { data: filters } = usePBLFilters();
  const { data: summary, loading: summaryLoading } = usePBLSummary(selected);
  const { data: districts, loading: districtsLoading } = usePBLDistricts({ month: selected.month, district: selected.district });

  function handleFilter(key: string, value: string) {
    setSelected(prev => ({ ...prev, [key]: value }));
  }

  const districtBarData = Object.entries(
    districts.reduce<Record<string, { total: number; part: number }>>((acc, d) => {
      if (!acc[d.district]) acc[d.district] = { total: 0, part: 0 };
      acc[d.district].total += d.totalSchools;
      acc[d.district].part += d.participatingSchools;
      return acc;
    }, {})
  ).map(([name, v]) => ({
    name,
    value: v.total > 0 ? v.part / v.total : 0,
    color: '#16a34a',
  }));

  const riskCounts = districts.reduce(
    (acc, d) => {
      acc[d.riskStatus] = (acc[d.riskStatus] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const riskPieData = ['On Track', 'Behind', 'At Risk', 'Critical'].map(status => ({
    name: status,
    value: riskCounts[status] ?? 0,
  }));

  return (
    <PageWrapper
      title="Program Dashboard"
      subtitle="PBL activity overview across all schools and districts"
    >
      <div className="space-y-5">
        <FilterBar filters={filters} selected={selected} onChange={handleFilter} />

        {summaryLoading ? (
          <PageSpinner />
        ) : summary ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
            <KPICard
              label="Total Schools"
              value={summary.totalSchools}
              highlight="blue"
            />
            <KPICard
              label="Participating"
              value={summary.participatingSchools}
              highlight="green"
            />
            <KPICard
              label="Participation %"
              value={formatPct(summary.participationRate)}
              highlight={summary.participationRate >= 0.75 ? 'green' : summary.participationRate >= 0.6 ? 'yellow' : 'orange'}
              trend={<TrendArrow change={summary.momParticipation} />}
              subtitle="vs last month"
            />
            <KPICard
              label="Evidence %"
              value={formatPct(summary.evidenceRate)}
              highlight={summary.evidenceRate >= 0.75 ? 'green' : 'yellow'}
            />
            <KPICard
              label="Total Enrollment"
              value={summary.totalEnrollment.toLocaleString()}
            />
            <KPICard
              label="Total Attendance"
              value={summary.totalAttendance.toLocaleString()}
            />
            <KPICard
              label="Attendance %"
              value={formatPct(summary.attendanceRate)}
              highlight={summary.attendanceRate >= 0.75 ? 'green' : summary.attendanceRate >= 0.6 ? 'yellow' : 'orange'}
              trend={<TrendArrow change={summary.momAttendance} />}
              subtitle="vs last month"
            />
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">No data available for selected filters</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            {districtsLoading ? (
              <PageSpinner />
            ) : (
              <BarChart
                data={districtBarData}
                title="District-wise Participation Rate"
                valueLabel="Participation %"
              />
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            {districtsLoading ? (
              <PageSpinner />
            ) : (
              <PieChart
                data={riskPieData}
                title="Risk Status Distribution"
              />
            )}
          </div>
        </div>

        {!districtsLoading && districts.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">District — Block Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-500 uppercase">District</th>
                    <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-500 uppercase">Block</th>
                    <th className="text-right py-2 pr-4 text-xs font-semibold text-gray-500 uppercase">Schools</th>
                    <th className="text-right py-2 pr-4 text-xs font-semibold text-gray-500 uppercase">PBL %</th>
                    <th className="text-right py-2 pr-4 text-xs font-semibold text-gray-500 uppercase">Attendance %</th>
                    <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {districts.slice(0, 10).map((d, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 pr-4 font-medium text-gray-800">{d.district}</td>
                      <td className="py-2 pr-4 text-gray-600">{d.block}</td>
                      <td className="py-2 pr-4 text-right text-gray-600">{d.totalSchools}</td>
                      <td className="py-2 pr-4 text-right font-medium" style={{ color: getRiskColor(d.riskStatus) }}>
                        {formatPct(d.participationRate)}
                      </td>
                      <td className="py-2 pr-4 text-right font-medium" style={{ color: getRiskColor(d.riskStatus) }}>
                        {formatPct(d.attendanceRate)}
                      </td>
                      <td className="py-2">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          d.riskStatus === 'On Track' ? 'bg-green-100 text-green-800' :
                          d.riskStatus === 'Behind' ? 'bg-yellow-100 text-yellow-800' :
                          d.riskStatus === 'At Risk' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {d.riskStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
