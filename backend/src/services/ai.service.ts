import Anthropic from '@anthropic-ai/sdk';
import type { GrantReport } from '../types/grant.types';

let client: Anthropic | null = null;

function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'PLACEHOLDER_REPLACE_WITH_REAL_KEY') {
    return null;
  }
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export interface NarrativeResult {
  narrative: string;
  factsUsed: Record<string, unknown>;
  generatedAt: string;
  isAI: boolean;
}

export async function generateGrantNarrative(
  grantId: string,
  month: string,
  facts: Record<string, unknown>,
  report: GrantReport
): Promise<NarrativeResult> {
  const generatedAt = new Date().toISOString();
  const ai = getClient();

  const factsText = Object.entries(facts)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join('\n');

  if (!ai) {
    return {
      narrative: generateFallbackNarrative(grantId, month, facts, report),
      factsUsed: facts,
      generatedAt,
      isAI: false,
    };
  }

  const prompt = `You are writing a formal grant progress report for an NGO called Mantra4Change.

Grant: ${report.grantInfo.grantName} (${report.grantInfo.donor})
Grant ID: ${grantId}
Reporting Month: ${month}
Districts Covered: ${report.grantInfo.coveredDistricts}

COMPUTED FACTS (use only these — do not invent numbers):
${factsText}

Milestone Summary: ${report.performanceData?.milestoneSummary ?? 'N/A'}

Write a professional 3-paragraph grant narrative report for the donor.
Paragraph 1: Program highlights and achievements this month.
Paragraph 2: Data insights — attendance, PBL participation, evidence submission trends.
Paragraph 3: Challenges, mitigation steps, and outlook for next month.

Be specific, use the exact numbers from COMPUTED FACTS, and maintain a positive but honest tone.
Do not add any fictional data. Write in third person.`;

  try {
    const message = await ai.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    const narrative = content.type === 'text' ? content.text : generateFallbackNarrative(grantId, month, facts, report);

    return { narrative, factsUsed: facts, generatedAt, isAI: true };
  } catch {
    return {
      narrative: generateFallbackNarrative(grantId, month, facts, report),
      factsUsed: facts,
      generatedAt,
      isAI: false,
    };
  }
}

function generateFallbackNarrative(
  _grantId: string,
  month: string,
  facts: Record<string, unknown>,
  report: GrantReport
): string {
  const perf = report.performanceData;
  const pblRate = perf ? `${(perf.pblCompletionRate * 100).toFixed(1)}%` : 'N/A';
  const evRate = perf ? `${(perf.evidenceSubmissionRate * 100).toFixed(1)}%` : 'N/A';
  const attRate = perf ? `${(perf.attendanceRate * 100).toFixed(1)}%` : 'N/A';
  const riskStatus = perf?.riskStatus ?? 'N/A';

  return `[DETERMINISTIC SUMMARY — AI narrative unavailable]

Program Progress for ${report.grantInfo.grantName} | ${month}:
Donor: ${report.grantInfo.donor} | Districts: ${report.grantInfo.coveredDistricts}

Key Performance Indicators:
• PBL Completion Rate: ${pblRate}
• Evidence Submission Rate: ${evRate}
• Attendance Rate: ${attRate}
• Overall Risk Status: ${riskStatus}

Milestone Status: ${report.performanceData?.milestoneSummary ?? 'No milestone data'}

${Object.entries(facts).map(([k, v]) => `• ${k}: ${v}`).join('\n')}

Note: To generate an AI-powered narrative, please configure a valid ANTHROPIC_API_KEY in backend/.env`;
}

export async function generateReviewNarrative(
  month: string,
  facts: Record<string, unknown>
): Promise<NarrativeResult> {
  const generatedAt = new Date().toISOString();
  const ai = getClient();

  if (!ai) {
    return {
      narrative: `[DETERMINISTIC SUMMARY — AI narrative unavailable]\n\nReview for ${month}:\n${Object.entries(facts).map(([k, v]) => `• ${k}: ${v}`).join('\n')}`,
      factsUsed: facts,
      generatedAt,
      isAI: false,
    };
  }

  const factsText = Object.entries(facts)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join('\n');

  const prompt = `You are preparing a monthly review summary for Mantra4Change NGO leadership.

Month: ${month}

PROGRAM DATA (use only these facts — do not invent numbers):
${factsText}

Write a concise executive summary (2-3 paragraphs) for leadership covering:
1. Key achievements and program health
2. Month-over-month trends
3. Priority actions needed

Be direct, data-driven, and actionable.`;

  try {
    const message = await ai.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    const narrative = content.type === 'text' ? content.text : `Review summary for ${month} — AI unavailable`;

    return { narrative, factsUsed: facts, generatedAt, isAI: true };
  } catch {
    return {
      narrative: `Review summary for ${month} — AI generation failed. See computed facts above.`,
      factsUsed: facts,
      generatedAt,
      isAI: false,
    };
  }
}
