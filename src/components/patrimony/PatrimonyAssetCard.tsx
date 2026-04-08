import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Home, Briefcase, Wallet, TrendingUp, Car, Package, 
  ChevronDown, ChevronUp, Pencil, Trash2, AlertTriangle,
  Droplet, Activity, DollarSign
} from 'lucide-react';
import { Asset, ASSET_TYPE_LABELS, LIQUIDITY_LABELS, RISK_LABELS, CATEGORY_COLORS } from '@/types/patrimony';
import { formatCurrency } from '@/utils/currency';

interface PatrimonyAssetCardProps {
  asset: Asset;
  percentage: number;
  totalAssets: number;
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
  onViewDetails: (asset: Asset) => void;
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

export const PatrimonyAssetCard: React.FC<PatrimonyAssetCardProps> = ({
  asset,
  percentage,
  totalAssets,
  onEdit,
  onDelete,
  onViewDetails,
}) => {
  const [expanded, setExpanded] = useState(false);
  const Icon = getIcon(asset.asset_type || asset.category);
  const color = CATEGORY_COLORS[asset.asset_type || asset.category] || '#6B7280';
  
  const hasRevaluation = asset.purchase_value && Number(asset.purchase_value) > 0;
  const revaluation = hasRevaluation
    ? ((Number(asset.value) - Number(asset.purchase_value)) / Number(asset.purchase_value)) * 100
    : null;

  const isIncomplete = !asset.asset_type || !asset.liquidity || !asset.risk_level;

  return (
    <Card className="bg-zinc-900/80 border-zinc-800 overflow-hidden">
      <div
        className="h-1"
        style={{ backgroundColor: color }}
      />
      
      <div className="p-4">
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

        {expanded && (
          <div className="mt-4 pt-4 border-t border-zinc-800 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-zinc-800/50">
                <div className="flex items-center gap-1.5 mb-1">
                  <Droplet className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-xs text-zinc-400">Liquidez</span>
                </div>
                <p className="text-sm font-medium text-white capitalize">
                  {LIQUIDITY_LABELS[asset.liquidity] || asset.liquidity}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-800/50">
                <div className="flex items-center gap-1.5 mb-1">
                  <Activity className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-xs text-zinc-400">Riesgo</span>
                </div>
                <p className="text-sm font-medium text-white capitalize">
                  {RISK_LABELS[asset.risk_level] || asset.risk_level}
                </p>
              </div>

              {hasRevaluation && (
                <div className="p-3 rounded-xl bg-zinc-800/50">
                  <div className="flex items-center gap-1.5 mb-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs text-zinc-400">Rentabilidad</span>
                  </div>
                  <p className={`text-sm font-medium ${
                    revaluation && revaluation >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {revaluation !== null ? `${revaluation >= 0 ? '+' : ''}${revaluation.toFixed(1)}%` : '-'}
                  </p>
                </div>
              )}
            </div>

            {hasRevaluation && (
              <div className="p-3 rounded-xl bg-zinc-800/50">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Valor Compra</span>
                  <span className="text-white font-medium">
                    {formatCurrency(Number(asset.purchase_value))}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-zinc-400">Valor Actual</span>
                  <span className="text-white font-medium">
                    {formatCurrency(Number(asset.value))}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-zinc-400">Diferencia</span>
                  <span className={`font-medium ${
                    Number(asset.value) >= Number(asset.purchase_value)
                      ? 'text-emerald-400'
                      : 'text-red-400'
                  }`}>
                    {Number(asset.value) >= Number(asset.purchase_value) ? '+' : ''}
                    {formatCurrency(Number(asset.value) - Number(asset.purchase_value))}
                  </span>
                </div>
              </div>
            )}

            {asset.description && (
              <p className="text-sm text-zinc-400">{asset.description}</p>
            )}

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

        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-3 flex items-center justify-center gap-1 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          {expanded ? (
            <>
              <span>Ocultar detalles</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              <span>Ver más</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </Card>
  );
};
