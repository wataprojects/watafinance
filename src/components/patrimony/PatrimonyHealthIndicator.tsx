import { Card } from '@/components/ui/card';
import { Heart, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { PatrimonyHealth, HealthStatus, IndicatorStatus } from '@/types/patrimony';

interface PatrimonyHealthIndicatorProps {
  health: PatrimonyHealth;
}

const statusConfig: Record<HealthStatus, {
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ElementType;
  label: string;
  textColor: string;
}> = {
  excellent: {
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    icon: CheckCircle,
    label: 'Excelente',
    textColor: 'text-emerald-400',
  },
  adequate: {
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    icon: AlertTriangle,
    label: 'Adecuado',
    textColor: 'text-yellow-400',
  },
  needs_attention: {
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    icon: XCircle,
    label: 'Requiere atención',
    textColor: 'text-red-400',
  },
};

const indicatorConfig: Record<IndicatorStatus, {
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  good: {
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
  },
  warning: {
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
  },
  critical: {
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
  },
};

export const PatrimonyHealthIndicator: React.FC<PatrimonyHealthIndicatorProps> = ({ health }) => {
  const config = statusConfig[health.status];
  const StatusIcon = config.icon;

  return (
    <Card className="bg-zinc-900/80 border-zinc-800 overflow-hidden">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-10 h-10 rounded-xl ${config.bgColor} flex items-center justify-center`}>
            <Heart className={`w-5 h-5 ${config.color}`} />
          </div>
          <div>
            <h2 className="text-sm font-medium text-zinc-400">SALUD DEL PATRIMONIO</h2>
            <div className="flex items-center gap-2">
              <StatusIcon className={`w-4 h-4 ${config.color}`} />
              <span className={`text-lg font-bold ${config.textColor}`}>
                {config.label}
              </span>
              <span className="text-sm text-zinc-500">
                ({health.score}/100)
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {health.indicators.map((indicator) => {
            const indConfig = indicatorConfig[indicator.status];
            return (
              <div
                key={indicator.id}
                className={`p-3 rounded-xl ${indConfig.bgColor} border ${indConfig.borderColor}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">{indicator.icon}</span>
                  <span className="text-xs font-medium text-zinc-300">
                    {indicator.name}
                  </span>
                </div>
                <p className={`text-sm font-semibold ${indConfig.color}`}>
                  {indicator.status === 'good' ? 'OK' : indicator.detail}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
