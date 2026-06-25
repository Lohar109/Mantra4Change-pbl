import { useState, useEffect, useCallback } from 'react';
import { fetchGrants, fetchGrantReport, fetchGrantMonths } from '../services/grant.service';
import type { GrantInfo, GrantReport } from '../types/grant.types';

export function useGrants() {
  const [data, setData] = useState<GrantInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGrants()
      .then(setData)
      .catch(() => setError('Failed to load grants'))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

export function useGrantReport(grantId: string | null, month: string | null) {
  const [data, setData] = useState<GrantReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!grantId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchGrantReport(grantId, month ?? undefined);
      setData(result);
    } catch {
      setError('Failed to load grant report');
    } finally {
      setLoading(false);
    }
  }, [grantId, month]);

  useEffect(() => { void load(); }, [load]);

  return { data, loading, error, refetch: load };
}

export function useGrantMonths(grantId: string | null) {
  const [data, setData] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!grantId) { setData([]); return; }
    setLoading(true);
    fetchGrantMonths(grantId)
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [grantId]);

  return { data, loading };
}
