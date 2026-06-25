import { useState, useEffect } from 'react';
import axios from 'axios';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { PageSpinner } from '../components/ui/Spinner';
import { API_BASE, MONTHS } from '../constants';
import { formatPct } from '../utils/risk.utils';

interface ReviewSummaryData {
  month: string;
  achievements: string[];
  momChanges: { metric: string; change: number; direction: 'up' | 'down' | 'same' }[];
  risks: { district: string; block: string; riskStatus: string; attendanceRate: number }[];
  priorityDistricts: string[];
  discussionPoints: string[];
}

export function ReviewSummary() {
  const [month, setMonth] = useState('September 2025');
  const [data, setData] = useState<ReviewSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get<ReviewSummaryData>(`${API_BASE}/api/review/summary`, { params: { month } })
      .then(res => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [month]);

  function handleCopy() {
    if (!data) return;
    const text = buildCopyText(data);
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function buildCopyText(d: ReviewSummaryData): string {
    const lines: string[] = [];
    lines.push(`MONTHLY REVIEW SUMMARY — ${d.month}`);
    lines.push('='.repeat(50));
    lines.push('\nACHIEVEMENTS');
    d.achievements.forEach(a => lines.push(`• ${a}`));
    lines.push('\nMONTH-OVER-MONTH CHANGES');
    d.momChanges.forEach(m => lines.push(`• ${m.metric}: ${m.direction === 'up' ? '+' : m.direction === 'down' ? '-' : ''}${formatPct(m.change)} (${m.direction})`));
    lines.push('\nRISK AREAS');
    d.risks.forEach(r => lines.push(`• ${r.district} / ${r.block}: ${r.riskStatus} (${formatPct(r.attendanceRate)})`));
    lines.push('\nPRIORITY DISTRICTS');
    d.priorityDistricts.forEach(p => lines.push(`• ${p}`));
    lines.push('\nDISCUSSION POINTS');
    d.discussionPoints.forEach(p => lines.push(`• ${p}`));
    return lines.join('\n');
  }

  return (
    <PageWrapper
      title="Monthly Review Summary"
      subtitle="Auto-generated structured summary for leadership review"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <select
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            value={month}
            onChange={e => setMonth(e.target.value)}
          >
            {MONTHS.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <Button variant="secondary" size="sm" onClick={handleCopy} disabled={!data}>
            {copied ? '✓ Copied!' : 'Copy to Clipboard'}
          </Button>
        </div>

        {loading ? (
          <PageSpinner />
        ) : !data ? (
          <div className="text-center py-12 text-gray-400">Failed to load review data</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">✅</span>
                <h3 className="text-sm font-semibold text-gray-700">Achievements This Month</h3>
              </div>
              <ul className="space-y-2">
                {data.achievements.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-green-500 mt-0.5 flex-shrink-0">•</span>
                    {a}
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">📈</span>
                <h3 className="text-sm font-semibold text-gray-700">Month-over-Month Changes</h3>
              </div>
              {data.momChanges.length === 0 ? (
                <p className="text-sm text-gray-400">No previous month to compare</p>
              ) : (
                <div className="space-y-2">
                  {data.momChanges.map((m, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{m.metric}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`font-medium ${m.direction === 'up' ? 'text-green-600' : m.direction === 'down' ? 'text-red-600' : 'text-gray-400'}`}>
                          {m.direction === 'up' ? '↑' : m.direction === 'down' ? '↓' : '→'} {formatPct(m.change)}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${m.direction === 'up' ? 'bg-green-100 text-green-700' : m.direction === 'down' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                          {m.direction}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">⚠️</span>
                <h3 className="text-sm font-semibold text-gray-700">At Risk / Critical Areas</h3>
                <span className="ml-auto text-xs text-gray-400">{data.risks.length} areas</span>
              </div>
              {data.risks.length === 0 ? (
                <p className="text-sm text-green-600 font-medium">All areas on track — excellent!</p>
              ) : (
                <div className="space-y-2">
                  {data.risks.map((r, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-800">{r.district}</span>
                        <span className="text-gray-400 mx-1">/</span>
                        <span className="text-gray-600">{r.block}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">{formatPct(r.attendanceRate)}</span>
                        <Badge label={r.riskStatus} variant="risk" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🎯</span>
                <h3 className="text-sm font-semibold text-gray-700">Priority Follow-up Districts</h3>
              </div>
              {data.priorityDistricts.length === 0 ? (
                <p className="text-sm text-green-600">No priority follow-ups required</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {data.priorityDistricts.map((d, i) => (
                    <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                      {d}
                    </span>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-5 lg:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">💬</span>
                <h3 className="text-sm font-semibold text-gray-700">Discussion Points for Leadership</h3>
              </div>
              <ol className="space-y-2">
                {data.discussionPoints.map((p, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    {p}
                  </li>
                ))}
              </ol>
            </Card>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
