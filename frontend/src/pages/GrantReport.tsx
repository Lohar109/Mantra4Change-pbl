import { useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageSpinner } from '../components/ui/Spinner';
import { useGrants, useGrantReport, useGrantMonths } from '../hooks/useGrantData';
import { generateNarrative } from '../services/grant.service';
import { formatPct } from '../utils/risk.utils';
import { MEDIA_TYPE_ICONS } from '../constants';
import type { NarrativeResult } from '../types/grant.types';

export function GrantReport() {
  const { data: grants } = useGrants();
  const [selectedGrant, setSelectedGrant] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const { data: months } = useGrantMonths(selectedGrant || null);
  const { data: report, loading, error: reportError } = useGrantReport(selectedGrant || null, selectedMonth || null);
  const [narrative, setNarrative] = useState<NarrativeResult | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  async function handleGenerateNarrative() {
    if (!selectedGrant || !selectedMonth || !report) return;
    setGenerating(true);
    setGenError(null);
    setNarrative(null);

    const perf = report.performanceData;
    const financeTotal = report.financeData.reduce((s, r) => s + r.approvedBudgetUnits, 0);
    const financeUsed = report.financeData.reduce((s, r) => s + r.cumulativeUtilizedUnits, 0);

    const facts: Record<string, unknown> = {
      'Grant Name': report.grantInfo.grantName,
      'Donor': report.grantInfo.donor,
      'Districts': report.grantInfo.coveredDistricts,
      'PBL Completion Rate': perf ? formatPct(perf.pblCompletionRate) : 'N/A',
      'Evidence Submission Rate': perf ? formatPct(perf.evidenceSubmissionRate) : 'N/A',
      'Attendance Rate': perf ? formatPct(perf.attendanceRate) : 'N/A',
      'Risk Status': perf?.riskStatus ?? 'N/A',
      'Finance Utilization': financeTotal > 0 ? formatPct(financeUsed / financeTotal) : 'N/A',
      'Milestone Summary': report.milestoneSummary,
      'Media Assets Count': report.mediaAssets.length,
    };

    try {
      const result = await generateNarrative(selectedGrant, selectedMonth, facts);
      setNarrative(result);
    } catch {
      setGenError('Failed to generate narrative. Check backend logs.');
    } finally {
      setGenerating(false);
    }
  }

  const perf = report?.performanceData;
  const financeTotal = report?.financeData.reduce((s, r) => s + r.approvedBudgetUnits, 0) ?? 0;
  const financeUsed = report?.financeData.reduce((s, r) => s + r.cumulativeUtilizedUnits, 0) ?? 0;
  const financeRate = financeTotal > 0 ? financeUsed / financeTotal : 0;

  return (
    <PageWrapper
      title="Grant Reports"
      subtitle="Finance, performance, and media assets per grant"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-3 bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
          <select
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 min-w-48"
            value={selectedGrant}
            onChange={e => { setSelectedGrant(e.target.value); setSelectedMonth(''); setNarrative(null); }}
          >
            <option value="">Select Grant...</option>
            {grants.map(g => (
              <option key={g.grantId} value={g.grantId}>{g.grantName} ({g.donor})</option>
            ))}
          </select>

          <select
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            value={selectedMonth}
            onChange={e => { setSelectedMonth(e.target.value); setNarrative(null); }}
            disabled={!selectedGrant}
          >
            <option value="">All Months</option>
            {months.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {!selectedGrant && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-sm">Select a grant to view its report</p>
          </div>
        )}

        {selectedGrant && loading && <PageSpinner />}

        {selectedGrant && !loading && reportError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {reportError} — check that the backend is running and the grant ID is valid.
          </div>
        )}

        {selectedGrant && !loading && !reportError && !report && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-sm">No report data found for this selection.</p>
          </div>
        )}

        {report && !loading && (
          <>
            <Card className="p-5">
              <div className="flex flex-wrap gap-4 items-start justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-900">{report.grantInfo.grantName}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {report.grantInfo.donor} · {report.grantInfo.coveredDistricts}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {report.grantInfo.periodStart} → {report.grantInfo.periodEnd}
                  </p>
                </div>
                {perf && <Badge label={perf.riskStatus} variant="risk" />}
              </div>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  { label: 'PBL Completion', value: perf ? formatPct(perf.pblCompletionRate) : '—' },
                  { label: 'Evidence Rate', value: perf ? formatPct(perf.evidenceSubmissionRate) : '—' },
                  { label: 'Attendance Rate', value: perf ? formatPct(perf.attendanceRate) : '—' },
                  { label: 'Finance Utilized', value: formatPct(financeRate) },
                  { label: 'Media Assets', value: report.mediaAssets.length },
                ].map(kpi => (
                  <div key={kpi.label} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">{kpi.label}</p>
                    <p className="text-lg font-bold text-gray-900 mt-0.5">{kpi.value}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Milestone Status</h3>
              <p className="text-sm text-gray-600">{report.milestoneSummary}</p>
            </Card>

            {report.financeData.length > 0 && (
              <Card className="p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Finance Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-500 uppercase">Budget Line</th>
                        <th className="text-right py-2 pr-4 text-xs font-semibold text-gray-500 uppercase">Approved</th>
                        <th className="text-right py-2 pr-4 text-xs font-semibold text-gray-500 uppercase">Utilized</th>
                        <th className="text-right py-2 pr-4 text-xs font-semibold text-gray-500 uppercase">Rate</th>
                        <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.financeData.map((r, i) => (
                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-2 pr-4 text-gray-800">{r.budgetLine}</td>
                          <td className="py-2 pr-4 text-right text-gray-600">{r.approvedBudgetUnits}</td>
                          <td className="py-2 pr-4 text-right text-gray-600">{r.cumulativeUtilizedUnits}</td>
                          <td className="py-2 pr-4 text-right font-medium text-gray-900">{formatPct(r.cumulativeUtilizationRate)}</td>
                          <td className="py-2 text-xs text-gray-500">{r.financeNote}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {report.mediaAssets.length > 0 && (
              <Card className="p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Evidence Gallery ({report.mediaAssets.length} assets)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {report.mediaAssets.map(asset => (
                    <div key={asset.recordId} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <div className="flex items-start gap-2">
                        <span className="text-xl">{MEDIA_TYPE_ICONS[asset.recordType] ?? '📎'}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-800 leading-tight">{asset.title}</p>
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{asset.summaryOrCaption}</p>
                          <div className="mt-1.5 flex gap-1.5 flex-wrap">
                            <Badge label={asset.recordType} variant="blue" />
                            <Badge label={asset.district} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Card className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">AI Grant Narrative</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Narrative generated using Claude AI based on computed data only
                  </p>
                </div>
                <Button
                  onClick={handleGenerateNarrative}
                  loading={generating}
                  disabled={!selectedGrant || !selectedMonth}
                >
                  {generating ? 'Generating...' : 'Generate AI Report'}
                </Button>
              </div>

              {genError && (
                <div className="p-3 bg-red-50 rounded-lg text-sm text-red-700 mb-3">{genError}</div>
              )}

              {narrative && (
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="text-xs font-semibold text-blue-700 uppercase mb-2">Computed Facts Used</h4>
                    <div className="grid grid-cols-2 gap-1">
                      {Object.entries(narrative.factsUsed).map(([k, v]) => (
                        <div key={k} className="text-xs text-blue-800">
                          <span className="font-medium">{k}:</span> {String(v)}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <h4 className="text-xs font-semibold text-gray-700 uppercase">
                        {narrative.isAI ? 'AI Narrative' : 'Deterministic Summary'}
                      </h4>
                      <Badge label={narrative.isAI ? 'Claude AI' : 'Fallback'} variant={narrative.isAI ? 'blue' : 'default'} />
                    </div>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {narrative.narrative}
                    </div>
                    <p className="text-xs text-gray-400 mt-3">Generated: {new Date(narrative.generatedAt).toLocaleString()}</p>
                  </div>
                </div>
              )}

              {!narrative && !generating && (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-3xl mb-2">🤖</div>
                  <p className="text-sm">Select a grant and month, then click "Generate AI Report"</p>
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </PageWrapper>
  );
}
