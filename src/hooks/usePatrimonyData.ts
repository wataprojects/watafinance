import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Asset, Debt, Investment, CategoryDistribution, PatrimonyOverview, CATEGORY_COLORS, CATEGORY_LABELS } from '@/types/patrimony';

export const usePatrimonyData = (userId: string | null) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [assetsRes, debtsRes, investmentsRes] = await Promise.all([
        supabase.from('patrimony').select('*').eq('user_id', userId).order('value', { ascending: false }),
        supabase.from('debts').select('*').eq('user_id', userId).order('current_amount', { ascending: false }),
        supabase.from('investments').select('*').eq('user_id', userId).order('current_value', { ascending: false }),
      ]);

      if (assetsRes.error) throw assetsRes.error;
      if (debtsRes.error) throw debtsRes.error;
      if (investmentsRes.error) throw investmentsRes.error;

      setAssets((assetsRes.data || []) as Asset[]);
      setDebts((debtsRes.data || []) as Debt[]);
      setInvestments((investmentsRes.data || []) as Investment[]);
    } catch (err) {
      console.error('[usePatrimonyData] Error fetching data:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalAssets = assets.reduce((sum, a) => sum + Number(a.value), 0);
  const totalDebts = debts.reduce((sum, d) => sum + Number(d.current_amount), 0);
  const netPatrimony = totalAssets - totalDebts;

  const overview: PatrimonyOverview = {
    totalAssets,
    totalDebts,
    netPatrimony,
    evolutionPercentage: 0,
    evolutionAmount: 0,
  };

  const distribution: CategoryDistribution[] = Object.entries(
    assets.reduce((acc, asset) => {
      const category = asset.asset_type || asset.category || 'otros';
      acc[category] = (acc[category] || 0) + Number(asset.value);
      return acc;
    }, {} as Record<string, number>)
  ).map(([category, value]) => ({
    category,
    label: CATEGORY_LABELS[category] || category,
    value,
    percentage: totalAssets > 0 ? (value / totalAssets) * 100 : 0,
    color: CATEGORY_COLORS[category] || '#6B7280',
  })).sort((a, b) => b.value - a.value);

  const addAsset = async (asset: Partial<Asset>) => {
    if (!userId) return null;
    
    const { data, error } = await supabase
      .from('patrimony')
      .insert({ ...asset, user_id: userId })
      .select()
      .single();
    
    if (!error && data) {
      setAssets(prev => [...prev, data as Asset]);
    }
    return { data, error };
  };

  const updateAsset = async (id: string, updates: Partial<Asset>) => {
    const { data, error } = await supabase
      .from('patrimony')
      .update({ ...updates, last_updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (!error && data) {
      setAssets(prev => prev.map(a => a.id === id ? data as Asset : a));
    }
    return { data, error };
  };

  const deleteAsset = async (id: string) => {
    const { error } = await supabase.from('patrimony').delete().eq('id', id);
    if (!error) {
      setAssets(prev => prev.filter(a => a.id !== id));
    }
    return { error };
  };

  return {
    assets,
    debts,
    investments,
    loading,
    error,
    totalAssets,
    totalDebts,
    netPatrimony,
    overview,
    distribution,
    addAsset,
    updateAsset,
    deleteAsset,
    refresh: fetchData,
  };
};
