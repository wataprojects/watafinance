import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PatrimonySnapshot } from '@/types/patrimony';

export const usePatrimonyEvolution = (userId: string | null) => {
  const [snapshots, setSnapshots] = useState<PatrimonySnapshot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSnapshots = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('patrimony_snapshots')
        .select('*')
        .eq('user_id', userId)
        .order('snapshot_date', { ascending: true })
        .limit(12);

      if (error) throw error;
      setSnapshots((data || []) as PatrimonySnapshot[]);
    } catch (err) {
      console.error('[usePatrimonyEvolution] Error fetching snapshots:', err);
      setError('Error al cargar el historial');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSnapshots();
  }, [fetchSnapshots]);

  const createSnapshot = useCallback(async (
    totalAssets: number,
    totalDebts: number,
    netPatrimony: number,
    distribution: Record<string, number>
  ) => {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from('patrimony_snapshots')
        .insert({
          user_id: userId,
          total_assets: totalAssets,
          total_debts: totalDebts,
          net_patrimony: netPatrimony,
          distribution,
          snapshot_date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (error) throw error;
      
      setSnapshots(prev => [...prev, data as PatrimonySnapshot]);
      return data;
    } catch (err) {
      console.error('[usePatrimonyEvolution] Error creating snapshot:', err);
      return null;
    }
  }, [userId]);

  const getLatestSnapshot = (): PatrimonySnapshot | null => {
    if (snapshots.length === 0) return null;
    return snapshots[snapshots.length - 1];
  };

  const getPreviousSnapshot = (): PatrimonySnapshot | null => {
    if (snapshots.length < 2) return null;
    return snapshots[snapshots.length - 2];
  };

  const getEvolutionPercentage = (
    currentNetPatrimony: number,
    previousNetPatrimony?: number
  ): number => {
    if (!previousNetPatrimony || previousNetPatrimony === 0) return 0;
    return ((currentNetPatrimony - previousNetPatrimony) / previousNetPatrimony) * 100;
  };

  const getEvolutionAmount = (
    currentNetPatrimony: number,
    previousNetPatrimony?: number
  ): number => {
    if (!previousNetPatrimony) return 0;
    return currentNetPatrimony - previousNetPatrimony;
  };

  const chartData = snapshots.map(s => ({
    date: s.snapshot_date,
    value: Number(s.net_patrimony),
    assets: Number(s.total_assets),
    debts: Number(s.total_debts),
  }));

  return {
    snapshots,
    loading,
    error,
    createSnapshot,
    getLatestSnapshot,
    getPreviousSnapshot,
    getEvolutionPercentage,
    getEvolutionAmount,
    chartData,
    refresh: fetchSnapshots,
  };
};
