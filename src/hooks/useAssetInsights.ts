import { useMemo } from 'react';
import { Asset, Investment, Debt, AssetInsight } from '@/types/patrimony';

interface UseAssetInsightsProps {
  asset: Asset;
  percentage: number;
  totalAssets: number;
  investments: Investment[];
  debts: Debt[];
}

export const useAssetInsights = ({
  asset,
  percentage,
  totalAssets,
  investments,
  debts,
}: UseAssetInsightsProps): AssetInsight[] => {
  return useMemo(() => {
    const insights: AssetInsight[] = [];

    // 1. Concentration Insight
    if (percentage > 70) {
      insights.push({
        type: 'concentration',
        severity: 'critical',
        title: 'Alta concentración',
        message: `Representa el ${percentage.toFixed(1)}% de tu patrimonio. Riesgo alto de dependencia.`,
        action: {
          label: 'Ver Diversificación',
          route: '/patrimonio',
          icon: '📊',
        },
      });
    } else if (percentage > 50) {
      insights.push({
        type: 'concentration',
        severity: 'warning',
        title: 'Concentración elevada',
        message: `Supera el 50% de tu patrimonio (${percentage.toFixed(1)}%). Considera diversificar.`,
        action: {
          label: 'Ver Inversiones',
          route: '/inversiones',
          icon: '📈',
        },
      });
    } else if (percentage > 30) {
      insights.push({
        type: 'concentration',
        severity: 'info',
        title: 'Activo importante',
        message: `Representa el ${percentage.toFixed(1)}% de tu patrimonio.`,
      });
    } else {
      insights.push({
        type: 'concentration',
        severity: 'success',
        title: 'Bien equilibrado',
        message: `Solo el ${percentage.toFixed(1)}% de tu patrimonio.`,
      });
    }

    // 2. Risk vs Value Insight
    if (asset.risk_level === 'alto' && percentage > 30) {
      insights.push({
        type: 'risk',
        severity: 'warning',
        title: 'Riesgo concentrado',
        message: 'Alto riesgo con alta concentración. Considera reducir exposición.',
        action: {
          label: 'Revisar Riesgos',
          route: '/patrimonio',
          icon: '⚡',
        },
      });
    }

    // 3. Liquidity Insight
    if (asset.liquidity === 'baja' && percentage > 40) {
      insights.push({
        type: 'liquidity',
        severity: 'warning',
        title: 'Baja liquidez',
        message: 'Gran parte de tu patrimonio en activos difíciles de convertir en efectivo.',
      });
    } else if (asset.liquidity === 'alta') {
      insights.push({
        type: 'liquidity',
        severity: 'info',
        title: 'Alta liquidez',
        message: 'Este activo puede convertirse fácilmente en efectivo.',
      });
    }

    // 4. Income Generation Insight
    if (asset.generates_income) {
      if (!asset.linked_investment_ids || asset.linked_investment_ids.length === 0) {
        insights.push({
          type: 'income',
          severity: 'warning',
          title: 'Ingresos sin vincular',
          message: 'Genera ingresos pero no está vinculado a inversiones.',
          action: {
            label: 'Vincular Inversión',
            route: '/inversiones',
            icon: '🔗',
          },
        });
      } else {
        const linkedInvestments = investments.filter(i => 
          asset.linked_investment_ids.includes(i.id)
        );
        insights.push({
          type: 'linkage',
          severity: 'success',
          title: 'Ingresos vinculados',
          message: `Conectado con ${linkedInvestments.length} inversión(es).`,
        });
      }
    } else if (asset.liquidity === 'baja' && Number(asset.value) > 50000) {
      insights.push({
        type: 'yield',
        severity: 'warning',
        title: 'Sin rentabilizar',
        message: 'Activo de alto valor sin generar ingresos.',
        action: {
          label: 'Explorar Inversiones',
          route: '/inversiones',
          icon: '💡',
        },
      });
    }

    // 5. Linked Debt Insight
    if (asset.linked_debt_id) {
      const linkedDebt = debts.find(d => d.id === asset.linked_debt_id);
      if (linkedDebt) {
        insights.push({
          type: 'linkage',
          severity: 'info',
          title: 'Deuda vinculada',
          message: `Asociado con: ${linkedDebt.name}`,
          action: {
            label: 'Ver Deuda',
            route: '/deudas',
            icon: '💳',
          },
        });
      }
    }

    return insights;
  }, [asset, percentage, totalAssets, investments, debts]);
};
