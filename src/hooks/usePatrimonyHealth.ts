import { useMemo } from 'react';
import { Asset, Debt, PatrimonyHealth, HealthIndicator, HealthStatus, IndicatorStatus } from '@/types/patrimony';

interface UsePatrimonyHealthProps {
  assets: Asset[];
  debts: Debt[];
  totalAssets: number;
  totalDebts: number;
  netPatrimony: number;
}

export const usePatrimonyHealth = ({
  assets,
  debts,
  totalAssets,
  totalDebts,
  netPatrimony,
}: UsePatrimonyHealthProps): PatrimonyHealth => {
  return useMemo(() => {
    const indicators: HealthIndicator[] = [];

    // 1. Concentration Indicator
    if (assets.length > 0 && totalAssets > 0) {
      const maxAssetPercentage = Math.max(
        ...assets.map(a => (Number(a.value) / totalAssets) * 100)
      );
      
      let concentrationStatus: IndicatorStatus = 'good';
      let concentrationDetail = 'Ningún activo supera el 50%';
      
      if (maxAssetPercentage > 70) {
        concentrationStatus = 'critical';
        concentrationDetail = `${maxAssetPercentage.toFixed(1)}% en un solo activo`;
      } else if (maxAssetPercentage > 50) {
        concentrationStatus = 'warning';
        concentrationDetail = `${maxAssetPercentage.toFixed(1)}% en un solo activo`;
      }
      
      indicators.push({
        id: 'concentration',
        name: 'Concentración',
        status: concentrationStatus,
        value: `${maxAssetPercentage.toFixed(1)}%`,
        detail: concentrationDetail,
        icon: concentrationStatus === 'good' ? '✅' : concentrationStatus === 'warning' ? '⚠️' : '🚨',
      });
    }

    // 2. Diversification Indicator
    const categoryCount = new Set(assets.map(a => a.asset_type || a.category)).size;
    let diversificationStatus: IndicatorStatus = 'good';
    let diversificationDetail = `${categoryCount} categorías`;
    
    if (categoryCount === 1 || assets.length < 3) {
      diversificationStatus = 'critical';
      diversificationDetail = assets.length < 3 
        ? `Solo ${assets.length} activo(s)` 
        : 'Solo 1 categoría';
    } else if (categoryCount === 2) {
      diversificationStatus = 'warning';
      diversificationDetail = '2 categorías';
    }
    
    indicators.push({
      id: 'diversification',
      name: 'Diversificación',
      status: diversificationStatus,
      value: `${categoryCount} categorías`,
      detail: diversificationDetail,
      icon: diversificationStatus === 'good' ? '✅' : diversificationStatus === 'warning' ? '⚠️' : '🚨',
    });

    // 3. Liquidity Indicator
    if (totalAssets > 0) {
      const liquidAssets = assets.filter(a => a.liquidity === 'alta');
      const liquidValue = liquidAssets.reduce((sum, a) => sum + Number(a.value), 0);
      const liquidPercentage = (liquidValue / totalAssets) * 100;
      
      let liquidityStatus: IndicatorStatus = 'good';
      let liquidityDetail = `${liquidPercentage.toFixed(1)}% líquido`;
      
      if (liquidPercentage < 15) {
        liquidityStatus = 'critical';
        liquidityDetail = 'Liquidez baja (<15%)';
      } else if (liquidPercentage < 30) {
        liquidityStatus = 'warning';
        liquidityDetail = 'Liquidez moderada (15-30%)';
      }
      
      indicators.push({
        id: 'liquidity',
        name: 'Liquidez',
        status: liquidityStatus,
        value: `${liquidPercentage.toFixed(1)}%`,
        detail: liquidityDetail,
        icon: liquidityStatus === 'good' ? '✅' : liquidityStatus === 'warning' ? '⚠️' : '🚨',
      });
    }

    // 4. Debt/Patrimony Ratio Indicator
    if (netPatrimony > 0) {
      const debtRatio = (totalDebts / netPatrimony) * 100;
      
      let debtStatus: IndicatorStatus = 'good';
      let debtDetail = `${debtRatio.toFixed(1)}%`;
      
      if (debtRatio > 100) {
        debtStatus = 'critical';
        debtDetail = 'Deuda supera patrimonio';
      } else if (debtRatio > 40) {
        debtStatus = 'warning';
        debtDetail = `Deuda moderada (${debtRatio.toFixed(1)}%)`;
      }
      
      indicators.push({
        id: 'debt_ratio',
        name: 'Deuda/Patrimonio',
        status: debtStatus,
        value: `${debtRatio.toFixed(1)}%`,
        detail: debtDetail,
        icon: debtStatus === 'good' ? '✅' : debtStatus === 'warning' ? '⚠️' : '🚨',
      });
    } else if (totalDebts > 0) {
      indicators.push({
        id: 'debt_ratio',
        name: 'Deuda/Patrimonio',
        status: 'critical',
        value: '>100%',
        detail: 'Deuda sin patrimonio neto',
        icon: '🚨',
      });
    }

    // Calculate overall status
    const hasCritical = indicators.some(i => i.status === 'critical');
    const hasWarning = indicators.some(i => i.status === 'warning');
    
    let status: HealthStatus = 'excellent';
    if (hasCritical) {
      status = 'needs_attention';
    } else if (hasWarning) {
      status = 'adequate';
    }

    // Calculate score (0-100)
    const goodCount = indicators.filter(i => i.status === 'good').length;
    const warningCount = indicators.filter(i => i.status === 'warning').length;
    const criticalCount = indicators.filter(i => i.status === 'critical').length;
    const totalIndicators = indicators.length || 1;
    
    const score = Math.round(
      ((goodCount * 100) + (warningCount * 50) + (criticalCount * 0)) / totalIndicators
    );

    return {
      status,
      score,
      indicators,
    };
  }, [assets, debts, totalAssets, totalDebts, netPatrimony]);
};
