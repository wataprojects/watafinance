import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Insight, InsightSeverity } from '@/types/patrimony';

interface PatrimonyInsightsProps {
  insights: Insight[];
}

const severityConfig: Record<InsightSeverity, { bg: string; border: string; icon: string }> = {
  critical: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    icon: '🚨',
  },
  warning: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    icon: '⚠️',
  },
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    icon: '💡',
  },
  success: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    icon: '✅',
  },
};

export const PatrimonyInsights: React.FC<PatrimonyInsightsProps> = ({ insights }) => {
  if (insights.length === 0) {
    return null;
  }

  const sortedInsights = [...insights].sort((a, b) => {
    const order: Record<InsightSeverity, number> = {
      critical: 0,
      warning: 1,
      info: 2,
      success: 3,
    };
    return order[a.severity] - order[b.severity];
  });

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-base flex items-center gap-2">
          <span className="text-lg">🎯</span>
          Análisis y Recomendaciones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {sortedInsights.map((insight) => {
          const config = severityConfig[insight.severity];
          return (
            <div
              key={insight.id}
              className={`p-3 rounded-xl ${config.bg} border ${config.border} transition-all hover:scale-[1.01]`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{insight.icon}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white mb-0.5">
                    {insight.title}
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {insight.message}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
