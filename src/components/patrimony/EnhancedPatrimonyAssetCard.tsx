import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Home, Briefcase, Wallet, TrendingUp, Car, Package, 
  ChevronDown, Pencil, Trash2, AlertTriangle, TrendingUp as TrendingUpIcon,
  Droplet, Shield, DollarSign, Link2, CreditCard, ArrowUpRight,
  Lightbulb, Plus, ExternalLink
} from 'lucide-react';
import { 
  Asset, Investment, Debt, 
  ASSET_TYPE_LABELS, LIQUIDITY_LABELS, RISK_LABELS, 
  CATEGORY_COLORS, AssetInsight
} from '@/types/patrimony';
import { formatCurrency } from '@/utils/currency';
import { useAssetInsights } from '@/hooks/useAssetInsights';
import { AssetInsightChip } from './AssetInsightChip';

interface EnhancedPatrimonyAssetCardProps {
  asset: Asset;
  percentage: number;
  totalAssets: number;
  investments?: Investment[];
  debts?: Debt[];
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
  onViewDetails: (asset: Asset) => void;
  onNavigate?: (route: string) => void;
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

// Helper to determine if card should be expandable
const hasExpandableContent = (asset: Asset, investments: Investment[]): boolean => {
  const hasLinkedInvestments = asset.linked_investment_ids && asset.linked_investment_ids.length > 0;
  const hasLinkedDebt = !!asset.linked_debt_id;
  const hasUnlinkedIncome = asset.generates_income && (!hasLinkedInvestments);
  const hasValuableRevaluation = asset.purchase_value && Number(asset.purchase_value) > 0;
  
  return hasLinkedInvestments || hasLinkedDebt || hasUnlinkedIncome || hasValuableRevaluation;
};

// Get liquidity chip color
const getLiquidityChipStyle = (liquidity: string) => {
  switch (liquidity) {
    case 'alta':
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    case 'media':
      return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
    case 'baja':
      return 'bg-red-500/15 text-red-400 border-red-500/30';
    default:
      return 'bg-zinc-700/50 text-zinc-400 border-zinc-600';
  }
};

// Get risk chip color
const getRiskChipStyle = (risk: string) => {
  switch (risk) {
    case 'bajo':
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    case 'medio':
      return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
    case 'alto':
      return 'bg-red-500/15 text-red-400 border-red-500/30';
    default:
      return 'bg-zinc-700/50 text-zinc-400 border-zinc-600';
  }
};

export const EnhancedPatrimonyAssetCard: React.FC<EnhancedPatrimonyAssetCardProps> = ({
  asset,
  percentage,
  totalAssets,
  investments = [],
  debts = [],
  onEdit,
  onDelete,
  onViewDetails,
  onNavigate,
}) => {
  const [expanded, setExpanded] = useState(false);
  const Icon = getIcon(asset.asset_type || asset.category);
  const color = CATEGORY_COLORS[asset.asset_type || asset.category] || '#6B7280';
  
  const hasRevaluation = asset.purchase_value && Number(asset.purchase_value) > 0;
  const revaluation = hasRevaluation
    ? ((Number(asset.value) - Number(asset.purchase_value)) / Number(asset.purchase_value)) * 100
    : null;

  const isIncomplete = !asset.asset_type || !asset.liquidity || !asset.risk_level;
  const canExpand = hasExpandableContent(asset, investments);

  const assetInsights = useAssetInsights({
    asset,
    percentage,
    totalAssets,
    investments,
    debts,
  });

  // Get critical/warning insight for collapsed view
  const criticalInsight = assetInsights.find(i => 
    i.severity === 'warning' || i.severity === 'critical'
  );
  
  // Get linked investments
  const linkedInvestments = useMemo(() => {
    if (!asset.linked_investment_ids || asset.linked_investment_ids.length === 0) return [];
    return investments.filter(i => asset.linked_investment_ids.includes(i.id));
  }, [asset.linked_investment_ids, investments]);

  // Get linked debt
  const linkedDebt = useMemo(() => {
    if (!asset.linked_debt_id) return null;
    return debts.find(d => d.id === asset.linked_debt_id) || null;
  }, [asset.linked_debt_id, debts]);

  return (
    <Card className="bg-zinc-900/80 border-zinc-800 overflow-hidden">
      {/* Color bar at top */}
      <div
        className="h-1.5"
        style={{ backgroundColor: color }}
      />
      
      <div className="p-4">
        {/* COLLAPSED STATE - Always visible */}
        <div className="flex items-start gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="w-6 h-6" style={{ color }} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-semibold text-white truncate">
                {asset.name}
              </h3>
              {isIncomplete && (
                <span className="flex-shrink-0" title="Datos incompletos">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500">
              {ASSET_TYPE_LABELS[asset.asset_type] || asset.category}
              {asset.generates_income && (
                <span className="ml-2 text-emerald-400">• Genera ingresos</span>
              )}
            </p>

            {/* Liquidity and Risk Chips - MOVED FROM EXPANDED */}
            <div className="flex items-center gap-2 mt-2">
              {asset.liquidity && (
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${getLiquidityChipStyle(asset.liquidity)}`}>
                  <Droplet className="w-3 h-3" />
                  <span>{LIQUIDITY_LABELS[asset.liquidity]}</span>
                </div>
              )}
              {asset.risk_level && (
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${getRiskChipStyle(asset.risk_level)}`}>
                  <Shield className="w-3 h-3" />
                  <span>{RISK_LABELS[asset.risk_level]}</span>
                </div>
              )}
            </div>

            {/* Critical/Warning Insight in Collapsed State */}
            {criticalInsight && (
              <div className="mt-2">
                <AssetInsightChip insight={criticalInsight} compact />
              </div>
            )}
          </div>

          <div className="text-right flex-shrink-0">
            <p className="text-lg font-bold text-white">
              {formatCurrency(Number(asset.value))}
            </p>
            <p className="text-xs text-zinc-500">
              {percentage.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* EXPANDED STATE - Only if has expandable content */}
        {expanded && canExpand && (
          <div className="mt-4 pt-4 border-t border-zinc-800 space-y-4">
            {/* Linked Investments Section */}
            {linkedInvestments.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-white">
                  <TrendingUpIcon className="w-4 h-4 text-emerald-400" />
                  <span>Inversiones Vinculadas ({linkedInvestments.length})</span>
                </div>
                <div className="space-y-2">
                  {linkedInvestments.map((investment) => (
                    <div
                      key={investment.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">{investment.name}</p>
                        <p className="text-xs text-zinc-500">{investment.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">
                          {formatCurrency(Number(investment.current_value))}
                        </p>
                        {investment.return_percentage !== undefined && (
                          <p className={`text-xs ${investment.return_percentage >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {investment.return_percentage >= 0 ? '+' : ''}{investment.return_percentage.toFixed(1)}%
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Link new investment button */}
                {onNavigate && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate('/inversiones')}
                    className="w-full border-zinc-700 bg-zinc-800/30 text-zinc-400 hover:text-white hover:bg-zinc-800 h-8 text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1.5" />
                    Vincular nueva inversión
                    <ArrowUpRight className="w-3 h-3 ml-1.5" />
                  </Button>
                )}
              </div>
            )}

            {/* Linked Debt Section */}
            {linkedDebt && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-white">
                  <CreditCard className="w-4 h-4 text-red-400" />
                  <span>Deuda Asociada</span>
                </div>
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{linkedDebt.name}</p>
                      {linkedDebt.creditor && (
                        <p className="text-xs text-zinc-500">{linkedDebt.creditor}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-400">
                        -{formatCurrency(Number(linkedDebt.current_amount))}
                      </p>
                      {linkedDebt.interest_rate && (
                        <p className="text-xs text-zinc-500">
                          {linkedDebt.interest_rate}% TAE
                        </p>
                      )}
                    </div>
                  </div>
                  {onNavigate && (
                    <button
                      onClick={() => onNavigate('/deudas')}
                      className="mt-2 text-xs text-zinc-400 hover:text-white flex items-center gap-1"
                    >
                      Ver detalles
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Unlinked Income Warning */}
            {asset.generates_income && linkedInvestments.length === 0 && onNavigate && (
              <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-400">
                      Ingresos sin vincular
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Este activo genera ingresos pero no está conectado a ninguna inversión.
                    </p>
                    <button
                      onClick={() => onNavigate('/inversiones')}
                      className="mt-2 text-xs font-medium text-yellow-400 hover:underline flex items-center gap-1"
                    >
                      <Link2 className="w-3 h-3" />
                      Vincular inversión
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Revaluation Section */}
            {hasRevaluation && (
              <div className="p-3 rounded-xl bg-zinc-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium text-white">Valoración</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-zinc-500">Compra</p>
                    <p className="text-sm font-medium text-white">
                      {formatCurrency(Number(asset.purchase_value))}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Actual</p>
                    <p className="text-sm font-medium text-white">
                      {formatCurrency(Number(asset.value))}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Cambio</p>
                    <p className={`text-sm font-medium ${
                      revaluation && revaluation >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {revaluation !== null ? `${revaluation >= 0 ? '+' : ''}${revaluation.toFixed(1)}%` : '-'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Net Monthly Flow - if has linked investments */}
            {linkedInvestments.length > 0 && (
              <div className="p-3 rounded-xl bg-zinc-800/50">
                <p className="text-xs text-zinc-500 mb-2">Flujo Mensual</p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-emerald-400">+€850</span>
                  <span className="text-zinc-600">→</span>
                  <span className="text-white font-medium">+€430 neto</span>
                </div>
              </div>
            )}

            {/* Additional Insights */}
            {assetInsights.length > 1 && (
              <div className="space-y-2">
                {assetInsights.slice(1, 3).map((insight, index) => (
                  <AssetInsightChip
                    key={index}
                    insight={insight}
                    onAction={onNavigate}
                  />
                ))}
              </div>
            )}

            {/* Description */}
            {asset.description && (
              <p className="text-sm text-zinc-400">{asset.description}</p>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(asset)}
                className="flex-1 border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700 h-9"
              >
                Ver Detalles
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onEdit(asset)}
                className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 h-9 w-9"
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onDelete(asset)}
                className="border-zinc-700 text-red-400 hover:text-red-300 hover:bg-red-500/10 h-9 w-9"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Expand/Collapse Button - Only if has content */}
        {canExpand && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full mt-3 flex items-center justify-center gap-1 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {expanded ? (
              <>
                <span>Ocultar detalles</span>
                <ChevronDown className="w-3.5 h-3.5 rotate-180" />
              </>
            ) : (
              <>
                <span>Ver más</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        )}
      </div>
    </Card>
  );
};
