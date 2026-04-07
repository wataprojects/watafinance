import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/utils/currency';
import { InvestmentMetrics } from '@/hooks/useInvestmentMetrics';
import { PerformanceIndicator } from './dashboard/PerformanceIndicator';
import { DollarSign, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface InvestmentMetricsCardProps {
  metrics: InvestmentMetrics;
  showPerformanceIndicator?: boolean;
}

const MetricItem = ({ 
  icon: Icon, 
  label, 
  value, 
  subValue,
  tooltip,
  valueColor = 'text-white'
}: { 
  icon: any; 
  label: string; 
  value: string; 
  subValue?: string;
  tooltip?: string;
  valueColor?: string;
}) => {
  const content = (
    <div className="flex items-start gap-2">
      <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center flex-nowrap">
        <Icon className="w-3.5 h-3.5 text-zinc-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-zinc-500 uppercase tracking-wider truncate">{label}</p>
        <p className={`text-sm font-semibold truncate ${valueColor}`} title={value}>
          {value}
        </p>
        {subValue && (
          <p className="text-[10px] text-zinc-500 truncate">{subValue}</p>
        )}
      </div>
    </div>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-300 text-xs max-w-48">
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
};

export const InvestmentMetricsCard = ({ 
  metrics, 
  showPerformanceIndicator = true 
}: InvestmentMetricsCardProps) => {
  const { 
    cashflowMensual, 
    paybackMeses, 
    roiAnualizado, 
    rendimiento,
    mesesActivos 
  } = metrics;

  const formatPayback = (meses: number | null): string => {
    if (meses === null) return 'N/A';
    if (meses < 12) return `${Math.round(meses)} meses`;
    const years = Math.floor(meses / 12);
    const remainingMonths = Math.round(meses % 12);
    if (remainingMonths === 0) return `${years} año${years > 1 ? 's' : ''}`;
    return `${years}a ${remainingMonths}m`;
  };

  return (
    <Card className="bg-zinc-800/50 border-zinc-700/50">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Métricas de Rendimiento</p>
          {showPerformanceIndicator && (
            <PerformanceIndicator rendimiento={rendimiento} size="sm" />
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <MetricItem 
            icon={DollarSign}
            label="Cashflow Mensual"
            value={formatCurrency(cashflowMensual)}
            subValue={`${mesesActivos} meses activo${mesesActivos > 1 ? 's' : ''}`}
            tooltip="Ingresos mensuales promedio generados por esta inversión"
            valueColor={cashflowMensual > 0 ? 'text-emerald-400' : 'text-zinc-400'}
          />
          
          <MetricItem 
            icon={Clock}
            label="Payback"
            value={formatPayback(paybackMeses)}
            tooltip="Tiempo estimado para recuperar la inversión inicial"
            valueColor={paybackMeses !== null && paybackMeses < 24 ? 'text-emerald-400' : paybackMeses !== null && paybackMeses > 60 ? 'text-rose-400' : 'text-amber-400'}
          />
          
          <MetricItem 
            icon={TrendingUp}
            label="ROI Anualizado"
            value={`${roiAnualizado >= 0 ? '+' : ''}${roiAnualizado.toFixed(1)}%`}
            tooltip="Rentabilidad anualizada de la inversión"
            valueColor={roiAnualizado > 15 ? 'text-emerald-400' : roiAnualizado < 5 ? 'text-rose-400' : 'text-amber-400'}
          />
          
          <MetricItem 
            icon={AlertCircle}
            label="Retorno Total"
            value={formatCurrency(metrics.retornoTotal)}
            subValue={`ROI: ${metrics.roiTotal >= 0 ? '+' : ''}${metrics.roiTotal.toFixed(1)}%`}
            tooltip="Beneficio total generado (revalorización + ingresos)"
            valueColor={metrics.retornoTotal >= 0 ? 'text-emerald-400' : 'text-rose-400'}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default InvestmentMetricsCard;