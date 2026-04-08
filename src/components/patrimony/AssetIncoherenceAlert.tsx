import { Card } from '@/components/ui/card';
import { Incoherence } from '@/types/patrimony';
import { RecommendationButton } from './RecommendationButton';
import { AlertTriangle, AlertCircle } from 'lucide-react';

interface AssetIncoherenceAlertProps {
  incoherence: Incoherence;
  onNavigate: (route: string) => void;
}

const severityConfig = {
  warning: {
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    iconColor: 'text-yellow-400',
    icon: AlertTriangle,
  },
  critical: {
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    iconColor: 'text-red-400',
    icon: AlertCircle,
  },
};

export const AssetIncoherenceAlert: React.FC<AssetIncoherenceAlertProps> = ({
  incoherence,
  onNavigate,
}) => {
  const config = severityConfig[incoherence.severity];
  const Icon = config.icon;

  return (
    <div className={`p-4 rounded-xl ${config.bgColor} border ${config.borderColor}`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl ${config.bgColor} border ${config.borderColor} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-zinc-200 leading-relaxed mb-3">
            {incoherence.message}
          </p>
          <div className="flex flex-wrap gap-2">
            {incoherence.recommendations.map((rec, index) => (
              <RecommendationButton
                key={index}
                label={rec.label}
                icon={rec.icon}
                onClick={() => onNavigate(rec.route)}
                variant={index === 0 ? 'primary' : 'outline'}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface IncoherenceListProps {
  incoherences: Incoherence[];
  onNavigate: (route: string) => void;
}

export const IncoherenceList: React.FC<IncoherenceListProps> = ({
  incoherences,
  onNavigate,
}) => {
  if (incoherences.length === 0) {
    return null;
  }

  return (
    <Card className="bg-zinc-900/80 border-zinc-800 overflow-hidden">
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-xl">🚨</span>
          <h2 className="text-base font-semibold text-white">
            Incoherencias Detectadas
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium">
            {incoherences.length}
          </span>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {incoherences.map((incoherence) => (
          <AssetIncoherenceAlert
            key={incoherence.id}
            incoherence={incoherence}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </Card>
  );
};
