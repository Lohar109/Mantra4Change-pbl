import { useState, useEffect, useCallback } from 'react';
import { fetchSummary, fetchDistricts, fetchMonths, fetchFilters } from '../services/pbl.service';
import type { PBLSummary, DistrictSummary, MonthlyComparison, AvailableFilters } from '../types/pbl.types';

interface Filters {
  month?: string;
  district?: string;
  block?: string;
  subject?: string;
}

export function usePBLSummary(filters: Filters) {
  const [data, setData] = useState<PBLSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchSummary(filters);
      setData(result);
    } catch {
      setError('Failed to load summary data');
    } finally {
      setLoading(false);
    }
  }, [filters.month, filters.district, filters.block, filters.subject]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { void load(); }, [load]);

  return { data, loading, error, refetch: load };
}

export function usePBLDistricts(filters: Pick<Filters, 'month' | 'district'>) {
  const [data, setData] = useState<DistrictSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchDistricts(filters);
      setData(result);
    } catch {
      setError('Failed to load district data');
    } finally {
      setLoading(false);
    }
  }, [filters.month, filters.district]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { void load(); }, [load]);

  return { data, loading, error };
}

export function usePBLMonths() {
  const [data, setData] = useState<MonthlyComparison[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonths()
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

export function usePBLFilters() {
  const [data, setData] = useState<AvailableFilters>({ months: [], districts: [], blocks: [], subjects: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFilters()
      .then(setData)
      .catch(() => setData({ months: [], districts: [], blocks: [], subjects: [] }))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}
