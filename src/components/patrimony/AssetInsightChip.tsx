import { AssetInsight, AssetInsightSeverity } from '@/types/patrimony';
import { AlertTriangle, Info, CheckCircle, AlertCircle } from 'lucide-react';

interface AssetInsightChipProps {
  insight: AssetInsight;
  compact?: boolean;
  onAction?: (route: string) => void;
}

const severityConfig: Record<AssetInsightSeverity, {
  bgColor: string;
  borderColor: string;
  textColor: string;
  icon: React.ElementType;
}> = {
  success: {
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-400',
    icon: CheckCircle,
  },
  info: {
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400',
    icon: Info,
  },
  warning: {
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    textColor: 'text-yellow-400',
    icon: AlertTriangle,
  },
  critical: {
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    textColor: 'text-red-400',
    icon: AlertCircle,
  },
};

export const AssetInsightChip: React.FC<AssetInsightChipProps> = ({
  insight,
  compact = false,
  onAction,
}) => {
  const config = severityConfig[insight.severity];
  const Icon = config.icon;

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs ${config.bgColor} border ${config.borderColor} ${config.textColor}`}>
        <Icon className="w-3 h-3" />
        <span className="font-medium">{insight.title}</span>
      </div>
    );
  }

  return (
    <div className={`p-3 rounded-xl ${config.bgColor} border ${config.borderColor}`}>
      <div className="flex items-start gap-2">
        <Icon className={`w-4 h-4 ${config.textColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${config.textColor}`}>
            {insight.title}
          </p>
          <p className="text-xs text-zinc-400 mt-0.5">
            {insight.message}
          </p>
          {insight.action && (
            <button
              onClick={() => insight.action && onAction?.(insight.action.route)}
              className={`mt-2 text-xs font-medium ${config.textColor} hover:underline flex items-center gap-1`}
            >
              <span>{insight.action.icon}</span>
              <span>{insight.action.label}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
