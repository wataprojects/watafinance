import { useMemo } from 'react';
import { Asset, Debt, Insight, CategoryDistribution } from '@/types/patrimony';

export const usePatrimonyInsights = (
  assets: Asset[],
  debts: Debt[],
  totalAssets: number,
  totalDebts: number,
  netPatrimony: number,
  distribution: CategoryDistribution[]
): Insight[] => {
  return useMemo(() => {
    const insights: Insight[] = [];

    if (assets.length === 0) {
      return [{
        id: 'no-assets',
        type: 'diversification',
        title: 'Sin activos registrados',
        message: 'Agrega tus primeros activos para comenzar a analizar tu patrimonio.',
        severity: 'info',
        icon: '📊',
      }];
    }

    // Concentration insight (>50% in single asset)
    const hasHighConcentration = assets.some(asset => {
      const percentage = (Number(asset.value) / totalAssets) * 100;
      return percentage > 50;
    });

    if (hasHighConcentration) {
      const maxAsset = assets.reduce((max, a) => 
        Number(a.value) > Number(max.value) ? a : max
      , assets[0]);
      insights.push({
        id: 'concentration',
        type: 'concentration',
        title: 'Alta concentración',
        message: `${maxAsset.name} representa más del 50% de tu patrimonio total.`,
        severity: 'warning',
        icon: '⚠️',
      });
    }

    // Diversification insight (<3 categories)
    if (distribution.length < 3 && assets.length > 0) {
      insights.push({
        id: 'diversification',
        type: 'diversification',
        title: 'Poca diversificación',
        message: `Solo tienes ${distribution.length} ${distribution.length === 1 ? 'categoría' : 'categorías'} de activos. Considera diversificar tu patrimonio.`,
        severity: 'warning',
        icon: '📈',
      });
    }

    // Debt ratio insight
    if (totalDebts > netPatrimony && netPatrimony > 0) {
      insights.push({
        id: 'debt-ratio',
        type: 'debt_ratio',
        title: 'Deuda elevada',
        message: 'Tu deuda supera tu patrimonio neto. Prioriza la reducción de deuda.',
        severity: 'critical',
        icon: '🚨',
      });
    }

    // Low liquidity insight (>70% illiquid)
    const illiquidValue = assets
      .filter(a => a.liquidity === 'baja')
      .reduce((sum, a) => sum + Number(a.value), 0);
    
    if (totalAssets > 0 && (illiquidValue / totalAssets) > 0.7) {
      insights.push({
        id: 'low-liquidity',
        type: 'low_liquidity',
        title: 'Baja liquidez',
        message: 'Más del 70% de tu patrimonio está en activos ilíquidos. Considera mantener más efectivo accesible.',
        severity: 'info',
        icon: '💧',
      });
    }

    // Orphan income (assets generating income but not linked)
    const orphanIncomeAssets = assets.filter(a => 
      a.generates_income && 
      (!a.linked_investment_ids || a.linked_investment_ids.length === 0)
    );

    if (orphanIncomeAssets.length > 0) {
      insights.push({
        id: 'orphan-income',
        type: 'orphan_income',
        title: 'Ingresos sin vincular',
        message: `${orphanIncomeAssets.length} activo(s) generan ingresos pero no están vinculados a inversiones.`,
        severity: 'warning',
        icon: '🔗',
      });
    }

    // High risk concentration
    const highRiskAssets = assets.filter(a => a.risk_level === 'alto');
    if (highRiskAssets.length > 0) {
      const highRiskValue = highRiskAssets.reduce((sum, a) => sum + Number(a.value), 0);
      if (totalAssets > 0 && (highRiskValue / totalAssets) > 0.3) {
        insights.push({
          id: 'high-risk',
          type: 'high_risk',
          title: 'Alta concentración de riesgo',
          message: 'Tienes un alto porcentaje de activos con nivel de riesgo alto. Diversifica para reducir riesgo.',
          severity: 'info',
          icon: '⚡',
        });
      }
    }

    // Positive revaluation insight
    const revaluedAssets = assets.filter(a => 
      a.purchase_value && Number(a.purchase_value) > 0 && Number(a.value) > Number(a.purchase_value)
    );

    if (revaluedAssets.length > 0) {
      const totalRevalued = revaluedAssets.reduce((sum, a) => sum + (Number(a.value) - Number(a.purchase_value)), 0);
      insights.push({
        id: 'positive-revaluation',
        type: 'positive_revaluation',
        title: 'Revalorización positiva',
        message: `Tus activos se han revalorizado en ${totalRevalued.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}.`,
        severity: 'success',
        icon: '📈',
      });
    }

    // Negative revaluation insight
    const devaluedAssets = assets.filter(a => 
      a.purchase_value && Number(a.purchase_value) > 0 && Number(a.value) < Number(a.purchase_value)
    );

    if (devaluedAssets.length > 0) {
      const totalDevalued = devaluedAssets.reduce((sum, a) => sum + (Number(a.purchase_value) - Number(a.value)), 0);
      insights.push({
        id: 'negative-revaluation',
        type: 'negative_revaluation',
        title: 'Revalorización negativa',
        message: `Algunos activos han perdido ${totalDevalued.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })} de valor.`,
        severity: 'warning',
        icon: '📉',
      });
    }

    // If no insights, add a positive one
    if (insights.length === 0) {
      insights.push({
        id: 'healthy',
        type: 'diversification',
        title: 'Patrimonio equilibrado',
        message: 'Tu patrimonio tiene una buena distribución y diversificación.',
        severity: 'success',
        icon: '✅',
      });
    }

    return insights;
  }, [assets, debts, totalAssets, totalDebts, netPatrimony, distribution]);
};
