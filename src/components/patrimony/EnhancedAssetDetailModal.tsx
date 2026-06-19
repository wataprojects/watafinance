import { Button } from '@/components/ui/button';
import { X, Edit2, Trash2, Link2, Home, Briefcase, Wallet, TrendingUp, Car, Package, Droplet, Activity, DollarSign, TrendingDown } from 'lucide-react';
import { Asset, Debt, Investment, ASSET_TYPE_LABELS, LIQUIDITY_LABELS, RISK_LABELS, CATEGORY_COLORS } from '@/types/patrimony';
import { AssetInsight } from '@/types/patrimony';
import { AssetInsightChip } from './AssetInsightChip';
import { RecommendationButton } from './RecommendationButton';
import { formatCurrency } from '@/utils/currency';
import { useAssetInsights } from '@/hooks/useAssetInsights';

interface EnhancedAssetDetailModalProps {
  asset: Asset;
  linkedDebt?: Debt | null;
  linkedInvestments?: Investment[];
  allInvestments?: Investment[];
  percentage: number;
  onClose: () => void;
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
  onNavigate: (route: string) => void;
}

const getIcon = (assetType: string) => {
  const icons: Record<string, React.ElementType> = {
    inmueble: Home,
    negocio: Briefcase,
    efectivo: Wallet,
    inversion: TrendingUp,
    vehiculo: Car,
    otros: Package,
  };
  return icons[assetType] || Package;
};

export const EnhancedAssetDetailModal: React.FC<EnhancedAssetDetailModalProps> = ({
  asset,
  linkedDebt,
  linkedInvestments = [],
  allInvestments = [],
  percentage,
  onClose,
  onEdit,
  onDelete,
  onNavigate,
}) => {
  const Icon = getIcon(asset.asset_type || asset.category);
  const color = CATEGORY_COLORS[asset.asset_type || asset.category] || '#6B7280';

  const assetInsights = useAssetInsights({
    asset,
    percentage,
    totalAssets: 0,
    investments: allInvestments,
    debts: linkedDebt ? [linkedDebt] : [],
  });

  const hasRevaluation = asset.purchase_value && Number(asset.purchase_value) > 0;
  const revaluation = hasRevaluation
    ? Number(asset.value) - Number(asset.purchase_value)
    : null;
  const revaluationPercent = hasRevaluation && Number(asset.purchase_value) > 0
    ? ((Number(asset.value) - Number(asset.purchase_value)) / Number(asset.purchase_value)) * 100
    : null;

  const liquidityConfig = {
    alta: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
    media: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', dot: 'bg-yellow-400' },
    baja: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', dot: 'bg-red-400' },
  }[asset.liquidity] || { color: 'text-zinc-400', bg: 'bg-zinc-500/10', border: 'border-zinc-500/30', dot: 'bg-zinc-400' };

  const riskConfig = {
    bajo: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
    medio: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', dot: 'bg-yellow-400' },
    alto: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', dot: 'bg-red-400' },
  }[asset.risk_level] || { color: 'text-zinc-400', bg: 'bg-zinc-500/10', border: 'border-zinc-500/30', dot: 'bg-zinc-400' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-zinc-900 rounded-2xl border border-zinc-800 max-h-[90vh] overflow-y-auto">
        <div 
          className="h-1.5 rounded-t-2xl flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        
        <div className="sticky top-0 z-10 bg-zinc-900 border-b border-zinc-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${color}20` }}
            >
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{asset.name}</h2>
              <p className="text-xs text-zinc-400">
                {ASSET_TYPE_LABELS[asset.asset_type] || asset.category} • {formatCurrency(Number(asset.value))}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Metrics Row */}
          <div className={`p-4 rounded-xl ${liquidityConfig.bg} border ${liquidityConfig.border}`}>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xs text-zinc-400 mb-1">% Patrimonio</p>
                <p className="text-lg font-bold text-white">{percentage.toFixed(1)}%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-zinc-400 mb-1">Liquidez</p>
                <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg ${liquidityConfig.bg} border ${liquidityConfig.border}`}>
                  <span className={`w-2 h-2 rounded-full ${liquidityConfig.dot}`} />
                  <span className={`text-sm font-medium ${liquidityConfig.color}`}>
                    {LIQUIDITY_LABELS[asset.liquidity] || asset.liquidity}
                  </span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-zinc-400 mb-1">Riesgo</p>
                <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg ${riskConfig.bg} border ${riskConfig.border}`}>
                  <span className={`w-2 h-2 rounded-full ${riskConfig.dot}`} />
                  <span className={`text-sm font-medium ${riskConfig.color}`}>
                    {RISK_LABELS[asset.risk_level] || asset.risk_level}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Revaluation Info */}
          {hasRevaluation && (
            <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
              <div className="flex items-center gap-2 mb-2">
                {revaluation !== null && revaluation >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
                <span className="text-sm font-medium text-zinc-300">Revalorización</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-zinc-500">Valor Compra</p>
                    <p className="text-sm font-semibold text-zinc-400">
                      {formatCurrency(Number(asset.purchase_value))}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Valor Actual</p>
                    <p className="text-sm font-semibold text-white">
                      {formatCurrency(Number(asset.value))}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Rentabilidad</p>
                    <div className="flex items-center justify-center gap-1">
                      {revaluationPercent !== null && revaluationPercent >= 0 ? (
                        <TrendingUp className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-400" />
                      )}
                      <p className={`text-sm font-semibold ${revaluationPercent !== null && revaluationPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {revaluationPercent !== null && (
                          <>
                            {revaluationPercent >= 0 ? '+' : ''}{revaluationPercent.toFixed(1)}%
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
            </div>
          )}

          {/* Insights Section */}
          {assetInsights.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-base">📊</span>
                <span className="text-sm font-medium text-zinc-300">Insight Contextual</span>
              </div>
              <div className="space-y-2">
                {assetInsights.slice(0, 2).map((insight, index) => (
                  <AssetInsightChip
                    key={index}
                    insight={insight}
                    onAction={onNavigate}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Relations Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-zinc-500" />
              <span className="text-sm font-medium text-zinc-300">Relaciones</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-zinc-300">Genera ingresos</span>
                </div>
                <span className={`text-sm font-medium ${asset.generates_income ? 'text-emerald-400' : 'text-zinc-400'}`}>
                  {asset.generates_income ? 'Sí' : 'No'}
                </span>
              </div>

              {linkedInvestments.length > 0 && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <p className="text-xs text-emerald-400 mb-2">Vinculado con:</p>
                  <div className="space-y-1">
                    {linkedInvestments.map(inv => (
                      <p key={inv.id} className="text-sm text-white font-medium">
                        {inv.name}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {linkedDebt && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-zinc-300">Deuda asociada</span>
                    </div>
                    <button
                      onClick={() => onNavigate('/dashboard/debts')}
                      className="text-xs text-blue-400 hover:underline"
                    >
                      Ver
                    </button>
                  </div>
                  <p className="text-sm text-white font-medium mt-1">{linkedDebt.name}</p>
                  <p className="text-xs text-red-400">
                    {formatCurrency(Number(linkedDebt.current_amount))}
                  </p>
                </div>
              )}

              {asset.generates_income && linkedInvestments.length === 0 && (
                <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                  <p className="text-sm text-yellow-400 mb-2">
                    Este activo genera ingresos pero no está vinculado a inversiones.
                  </p>
                  <RecommendationButton
                    label="Ver Inversiones"
                    icon="📈"
                    onClick={() => onNavigate('/dashboard/investments')}
                    variant="primary"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {asset.description && (
            <div className="p-3 rounded-xl bg-zinc-800/50">
              <p className="text-xs text-zinc-500 mb-1">Descripción</p>
              <p className="text-sm text-zinc-300">{asset.description}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-zinc-900 border-t border-zinc-800 p-4 space-y-2">
          <Button
            onClick={() => {
              onClose();
              onEdit(asset);
            }}
            className="w-full h-11 bg-blue-500 hover:bg-blue-600 text-white font-medium"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Editar Activo
          </Button>
          
          <Button
            variant="outline"
            onClick={() => {
              onClose();
              onDelete(asset);
            }}
            className="w-full h-11 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 font-medium"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  );
};
