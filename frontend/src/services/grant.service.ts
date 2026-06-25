import axios from 'axios';
import { API_BASE } from '../constants';
import type { GrantInfo, GrantReport, NarrativeResult } from '../types/grant.types';

const api = axios.create({ baseURL: API_BASE });

export async function fetchGrants(): Promise<GrantInfo[]> {
  const { data } = await api.get<GrantInfo[]>('/api/grants');
  return data;
}

export async function fetchGrantReport(grantId: string, month?: string): Promise<GrantReport> {
  const { data } = await api.get<GrantReport>(`/api/grants/${grantId}/report`, {
    params: month ? { month } : {},
  });
  return data;
}

export async function fetchGrantMonths(grantId: string): Promise<string[]> {
  const { data } = await api.get<string[]>(`/api/grants/${grantId}/months`);
  return data;
}

export async function generateNarrative(
  grantId: string,
  month: string,
  facts: Record<string, unknown>
): Promise<NarrativeResult> {
  const { data } = await api.post<NarrativeResult>('/api/grants/generate-narrative', {
    grantId,
    month,
    facts,
  });
  return data;
}
