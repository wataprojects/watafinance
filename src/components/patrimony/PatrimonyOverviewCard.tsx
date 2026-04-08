import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { PatrimonyOverview } from '@/types/patrimony';

interface PatrimonyOverviewCardProps {
  overview: PatrimonyOverview;
}

export const PatrimonyOverviewCard: React.FC<PatrimonyOverviewCardProps> = ({ overview }) => {
  const { totalAssets, totalDebts, netPatrimony, evolutionPercentage } = overview;
  
  const isPositive = evolutionPercentage > 0;
  const isNegative = evolutionPercentage < 0;
  const isNeutral = evolutionPercentage === 0;

  return (
    <Card className="bg-gradient-to-br from-emerald-900/40 via-zinc-900 to-zinc-900 border-emerald-800/50">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
            <span className="text-2xl">💰</span>
          </div>
          <div>
            <h2 className="text-sm font-medium text-emerald-400/80">Patrimonio Neto</h2>
            <p className="text-xs text-zinc-500">Activos - Deudas</p>
          </div>
        </div>

        <div className="text-center mb-6">
          <p className="text-4xl font-bold text-white mb-1">
            {formatCurrency(netPatrimony)}
          </p>
          
          {!isNeutral && (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
              isPositive 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>
                {isPositive ? '+' : ''}{evolutionPercentage.toFixed(1)}% vs mes anterior
              </span>
            </div>
          )}

          {isNeutral && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-zinc-800 text-zinc-400">
              <Minus className="w-4 h-4" />
              <span>Sin cambios</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-xs text-emerald-400/70 mb-1">Total Activos</p>
            <p className="text-lg font-bold text-emerald-400">
              {formatCurrency(totalAssets)}
            </p>
          </div>
          
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-xs text-red-400/70 mb-1">Total Deudas</p>
            <p className="text-lg font-bold text-red-400">
              {formatCurrency(totalDebts)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
