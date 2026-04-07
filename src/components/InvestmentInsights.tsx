import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Insight, getInsightColor, getInsightIcon } from '@/utils/investmentInsights';
import { Lightbulb, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InvestmentInsightsProps {
  insights: Insight[];
  onDismiss?: (id: string) => void;
  onAction?: (insight: Insight) => void;
}

export const InvestmentInsights = ({ insights, onDismiss, onAction }: InvestmentInsightsProps) => {
  if (insights.length === 0) {
    return null;
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
      <CardHeader className="pb-2 px-4 pt-4"> 
        <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          Insights Inteligentes
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-zinc-800/50">
          {insights.map((insight) => (
            <div 
              key={insight.id} 
              className={`p-3 flex items-start gap-3 ${getInsightColor(insight.type)}`}
            >
              <span className="text-lg flex-nowrap">{getInsightIcon(insight.type)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{insight.title}</p>
                <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">{insight.description}</p>
                {onAction && insight.investmentId && insight.type === 'alerta' && (
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="h-auto p-0 text-xs text-purple-400 hover:text-purple-300 mt-1"
                    onClick={() => onAction(insight)}
                  >
                    Ver detalles →
                  </Button>
                )}
              </div>
              {onDismiss && (
                <button 
                  onClick={() => onDismiss(insight.id)}
                  className="p-1 rounded-full hover:bg-zinc-800/50 text-zinc-500 hover:text-zinc-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default InvestmentInsights;