import axios from 'axios';
import { API_BASE } from '../constants';
import type { AvailableFilters, DistrictSummary, MonthlyComparison, PBLSummary } from '../types/pbl.types';

const api = axios.create({ baseURL: API_BASE });

export async function fetchSummary(params: {
  month?: string;
  district?: string;
  block?: string;
  subject?: string;
}): Promise<PBLSummary> {
  const { data } = await api.get<PBLSummary>('/api/pbl/summary', { params });
  return data;
}

export async function fetchDistricts(params: {
  month?: string;
  district?: string;
}): Promise<DistrictSummary[]> {
  const { data } = await api.get<DistrictSummary[]>('/api/pbl/districts', { params });
  return data;
}

export async function fetchMonths(): Promise<MonthlyComparison[]> {
  const { data } = await api.get<MonthlyComparison[]>('/api/pbl/months');
  return data;
}

export async function fetchFilters(): Promise<AvailableFilters> {
  const { data } = await api.get<AvailableFilters>('/api/pbl/filters');
  return data;
}
