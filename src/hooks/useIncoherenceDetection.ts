import { useMemo } from 'react';
import { Asset, Investment, Debt, Incoherence } from '@/types/patrimony';

interface UseIncoherenceDetectionProps {
  assets: Asset[];
  investments: Investment[];
  debts: Debt[];
  totalAssets: number;
}

export const useIncoherenceDetection = ({
  assets,
  investments,
  debts,
  totalAssets,
}: UseIncoherenceDetectionProps): Incoherence[] => {
  return useMemo(() => {
    const incoherences: Incoherence[] = [];

    // 1. Orphan Income - Assets generating income but not linked to investments
    assets.forEach(asset => {
      if (asset.generates_income && 
          (!asset.linked_investment_ids || asset.linked_investment_ids.length === 0)) {
        incoherences.push({
          id: `orphan-income-${asset.id}`,
          type: 'orphan_income',
          severity: 'warning',
          message: `"${asset.name}" genera ingresos pero no está vinculado a ninguna inversión.`,
          assetId: asset.id,
          recommendations: [
            {
              label: 'Ver Inversiones',
              route: '/inversiones',
              icon: '📈',
            },
            {
              label: 'Vincular Activo',
              route: '/patrimonio',
              icon: '🔗',
            },
          ],
        });
      }
    }, []);

    // 2. Unlinked Investments - Investments that might not be connected to assets
    const linkedInvestmentIds = new Set(
      assets.flatMap(a => a.linked_investment_ids || [])
    );
    
    investments.forEach(investment => {
      if (!linkedInvestmentIds.has(investment.id) && investment.current_value > 10000) {
        incoherences.push({
          id: `unlinked-investment-${investment.id}`,
          type: 'unlinked_investment',
          severity: 'warning',
          message: `"${investment.name}" no está vinculado a ningún activo.`,
          relatedIds: [investment.id],
          recommendations: [
            {
              label: 'Vincular Activo',
              route: '/patrimonio',
              icon: '🔗',
            },
          ],
        });
      }
    });

    // 3. Unlinked Debts - Debts not associated with any asset
    const linkedDebtIds = new Set(
      assets.filter(a => a.linked_debt_id).map(a => a.linked_debt_id!)
    );
    
    debts.forEach(debt => {
      if (!linkedDebtIds.has(debt.id) && Number(debt.current_amount) > 5000) {
        incoherences.push({
          id: `unlinked-debt-${debt.id}`,
          type: 'unlinked_debt',
          severity: 'warning',
          message: `"${debt.name}" (${debt.current_amount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}) no está vinculado a ningún activo.`,
          relatedIds: [debt.id],
          recommendations: [
            {
              label: 'Vincular Activo',
              route: '/deudas',
              icon: '🏠',
            },
          ],
        });
      }
    });

    // 4. Low Yield Cash - Cash without returns
    if (totalAssets > 0) {
      const cashAssets = assets.filter(a => a.asset_type === 'efectivo');
      const totalCash = cashAssets.reduce((sum, a) => sum + Number(a.value), 0);
      const cashPercentage = (totalCash / totalAssets) * 100;
      
      // If more than 30% in cash with no yield
      if (cashPercentage > 30 && investments.length === 0) {
        incoherences.push({
          id: 'low-yield-cash',
          type: 'low_yield',
          severity: 'warning',
          message: `Tienes ${cashPercentage.toFixed(1)}% de tu patrimonio en efectivo sin rendimiento.`,
          recommendations: [
            {
              label: 'Crear Inversión',
              route: '/inversiones',
              icon: '💰',
            },
          ],
        });
      }
    }

    // 5. High Concentration - Single asset too dominant
    if (assets.length > 0 && totalAssets > 0) {
      const maxPercentage = Math.max(
        ...assets.map(a => (Number(a.value) / totalAssets) * 100)
      );
      
      if (maxPercentage > 70) {
        const dominantAsset = assets.find(a => 
          (Number(a.value) / totalAssets) * 100 === maxPercentage
        );
        
        if (dominantAsset) {
          incoherences.push({
            id: 'high-concentration',
            type: 'high_concentration',
            severity: 'critical',
            message: `"${dominantAsset.name}" representa el ${maxPercentage.toFixed(1)}% de tu patrimonio. Alta dependencia.`,
            assetId: dominantAsset.id,
            recommendations: [
              {
                label: 'Diversificar',
                route: '/patrimonio',
                icon: '📊',
              },
              {
                label: 'Ver Inversiones',
                route: '/inversiones',
                icon: '📈',
              },
            ],
          });
        }
      }
    }

    // Sort by severity (critical first)
    return incoherences.sort((a, b) => {
      if (a.severity === 'critical' && b.severity !== 'critical') return -1;
      if (a.severity !== 'critical' && b.severity === 'critical') return 1;
      return 0;
    });
  }, [assets, investments, debts, totalAssets]);
};
