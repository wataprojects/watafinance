import { Button } from '@/components/ui/button';
import { X, Edit2, Trash2, Link2, Home, Briefcase, Wallet, TrendingUp, Car, Package, Droplet, Activity, DollarSign } from 'lucide-react';
import { Asset, ASSET_TYPE_LABELS, LIQUIDITY_LABELS, RISK_LABELS, CATEGORY_COLORS } from '@/types/patrimony';
import { formatCurrency } from '@/utils/currency';

interface AssetDetailModalProps {
  asset: Asset;
  linkedDebt?: { id: string; name: string } | null;
  onClose: () => void;
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
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

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  asset,
  linkedDebt,
  onClose,
  onEdit,
  onDelete,
}) => {
  const Icon = getIcon(asset.asset_type || asset.category);
  const color = CATEGORY_COLORS[asset.asset_type || asset.category] || '#6B7280';

  const hasRevaluation = asset.purchase_value && Number(asset.purchase_value) > 0;
  const revaluation = hasRevaluation
    ? Number(asset.value) - Number(asset.purchase_value)
    : null;
  const revaluationPercent = hasRevaluation && Number(asset.purchase_value) > 0
    ? ((Number(asset.value) - Number(asset.purchase_value)) / Number(asset.purchase_value)) * 100
    : null;

  const liquidityColor = {
    alta: 'text-emerald-400',
    media: 'text-yellow-400',
    baja: 'text-red-400',
  }[asset.liquidity] || 'text-zinc-400';

  const riskColor = {
    bajo: 'text-emerald-400',
    medio: 'text-yellow-400',
    alto: 'text-red-400',
  }[asset.risk_level] || 'text-zinc-400';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-zinc-900 rounded-2xl border border-zinc-800">
        <div 
          className="h-1 rounded-t-2xl"
          style={{ backgroundColor: color }}
        />
        
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
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
                {ASSET_TYPE_LABELS[asset.asset_type] || asset.category}
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
          <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-zinc-500 mb-1">Valor Actual</p>
                <p className="text-xl font-bold text-white">
                                  {formatCurrency(Number(asset.value))}
                                </p>
              </div>
              
              {hasRevaluation && (
                <>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Valor Compra</p>
                    <p className="text-xl font-bold text-zinc-400">
                      {formatCurrency(Number(asset.purchase_value))}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Revalorización</p>
                    <p className={`text-lg font-bold ${
                      revaluation !== null && revaluation >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {revaluation !== null && (
                        <>
                          {revaluation >= 0 ? '+' : ''}{formatCurrency(Number(revaluation))}
                        </>
                      )}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Rentabilidad</p>
                    <p className={`text-lg font-bold ${
                      revaluationPercent !== null && revaluationPercent >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {revaluationPercent !== null && (
                        <>
                          {revaluationPercent >= 0 ? '+' : ''}{revaluationPercent.toFixed(1)}%
                        </>
                      )}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-zinc-500" />
              Detalles
            </p>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50">
                <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5" />
                  Liquidez
                </span>
                <span className={`text-sm font-medium capitalize ${liquidityColor}`}>
                  {LIQUIDITY_LABELS[asset.liquidity] || asset.liquidity}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50">
                <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  Riesgo
                </span>
                <span className={`text-sm font-medium capitalize ${riskColor}`}>
                  {RISK_LABELS[asset.risk_level] || asset.risk_level}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50">
              <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" />
                Genera ingresos
              </span>
              <span className={`text-sm font-medium ${
                asset.generates_income ? 'text-emerald-400' : 'text-zinc-400'
              }`}>
                {asset.generates_income ? 'Sí' : 'No'}
              </span>
            </div>
          </div>

          {linkedDebt && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-zinc-500" />
                Vinculaciones
              </p>
              
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-xs text-red-400 mb-1">Deuda vinculada</p>
                <p className="text-sm font-medium text-white">{linkedDebt.name}</p>
              </div>
            </div>
          )}

          {asset.description && (
            <div className="p-3 rounded-xl bg-zinc-800/50">
              <p className="text-xs text-zinc-500 mb-1">Descripción</p>
              <p className="text-sm text-zinc-300">{asset.description}</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-zinc-800 space-y-2">
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
