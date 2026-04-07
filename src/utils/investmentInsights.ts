import { InvestmentMetrics, PortfolioMetrics } from '@/hooks/useInvestmentMetrics';

export type InsightType = 'rendimiento' | 'optimizacion' | 'alerta' | 'comparacion';

export interface Insight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  priority: number;
  investmentId?: string;
  investmentName?: string;
}

const getCategoryLabel = (type: string): string => {
  const labels: Record<string, string> = {
    digital: 'digital',
    inmuebles: 'inmuebles',
    bolsa: 'bolsa',
    negocio: 'negocio',
    contenido: 'contenido',
    oro: 'oro',
    crypto: 'crypto',
    otros: 'otros',
  };
  return labels[type] || type;
};

export const generateInsights = (
  portfolioMetrics: PortfolioMetrics,
  allInvestments: { id: string; name: string; investment_type: string; type: string }[]
): Insight[] => {
  const insights: Insight[] = [];
  const { processedInvestments, mejorInversion, promedioROIAnualizado } = portfolioMetrics;

  if (processedInvestments.length === 0) return insights;

  // 1. Insights de ALERTA - Prioridad más alta
  
  // Detectar inversiones income sin ingresos vinculados
  processedInvestments.forEach((inv) => {
    if (inv.investment_type === 'income' && inv.incomeCount === 0) {
      insights.push({
        id: `alerta-sin-ingresos-${inv.id}`,
        type: 'alerta',
        title: 'Inversión sin ingresos vinculados',
        description: `"${inv.name}" es de tipo generadora de ingresos pero no tiene ingresos vinculados.`,
        priority: 1,
        investmentId: inv.id,
        investmentName: inv.name,
      });
    }
  });

  // Detectar inversiones con payback muy largo
  processedInvestments.forEach((inv) => {
    if (inv.paybackMeses !== null && inv.paybackMeses > 60) {
      insights.push({
        id: `alerta-payback-${inv.id}`,
        type: 'alerta',
        title: 'Tiempo de recuperación prolongado',
        description: `${inv.name} tarda ${Math.round(inv.paybackMeses)} meses en recuperar la inversión inicial.`,
        priority: 2,
        investmentId: inv.id,
        investmentName: inv.name,
      });
    }
  });

  // 2. Insights de RENDIMIENTO
  
  // Inversiones por debajo del promedio
  processedInvestments.forEach((inv) => {
    if (inv.roiAnualizado < promedioROIAnualizado - 5 && promedioROIAnualizado > 0) {
      insights.push({
        id: `rendimiento-bajo-${inv.id}`,
        type: 'rendimiento',
        title: 'Rendimiento inferior al promedio',
        description: `${inv.name} tiene un ROI anualizado del ${inv.roiAnualizado.toFixed(1)}%, por debajo del promedio del portfolio (${promedioROIAnualizado.toFixed(1)}%).`,
        priority: 3,
        investmentId: inv.id,
        investmentName: inv.name,
      });
    }
  });

  // 3. Insights de OPTIMIZACIÓN
  
  // Sugerir reinversión de beneficios
  processedInvestments.forEach((inv) => {
    if (inv.retornoTotal > 0 && inv.investment_type === 'income') {
      insights.push({
        id: `optimizacion-reinversion-${inv.id}`,
        type: 'optimizacion',
        title: 'Considera reinvertir beneficios',
        description: `${inv.name} ha generado ${inv.retornoTotal.toFixed(2)}€ en retornos. Reinvertirlos podría acelerar tu payback.`,
        priority: 4,
        investmentId: inv.id,
        investmentName: inv.name,
      });
    }
  });

  // Sugerir aumentar aportaciones
  processedInvestments.forEach((inv) => {
    if (inv.investment_type === 'income' && inv.incomeCount > 0 && inv.paybackMeses !== null && inv.paybackMeses > 24) {
      insights.push({
        id: `optimizacion-aportacion-${inv.id}`,
        type: 'optimizacion',
        title: 'Aumentar aportaciones mensuales',
        description: `Incrementar la aportaciones a "${inv.name}" podría reducir significativamente el tiempo de recuperación.`,
        priority: 5,
        investmentId: inv.id,
        investmentName: inv.name,
      });
    }
  });

  // 4. Insights de COMPARACIÓN
  
  // Mejor inversión
  if (mejorInversion && mejorInversion.roiAnualizado > 0) {
    insights.push({
      id: 'comparacion-mejor',
      type: 'comparacion',
      title: 'Tu mejor inversión',
      description: `${mejorInversion.name} tiene el mayor ROI anualizado con ${mejorInversion.roiAnualizado.toFixed(1)}%.`,
      priority: 6,
      investmentId: mejorInversion.id,
      investmentName: mejorInversion.name,
    });
  }

  // Comparación entre categorías
  const categoryROIs: Record<string, number[]> = {};
  processedInvestments.forEach((inv) => {
    if (!categoryROIs[inv.type]) {
      categoryROIs[inv.type] = [];
    }
    categoryROIs[inv.type].push(inv.roiAnualizado);
  });

  const categoryAverages = Object.entries(categoryROIs).map(([type, rois]) => ({
    type,
    average: rois.reduce((a, b) => a + b, 0) / rois.length,
  }));

  if (categoryAverages.length >= 2) {
    const sorted = categoryAverages.sort((a, b) => b.average - a.average);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    
    if (best.average - worst.average > 5) {
      insights.push({
        id: 'comparacion-categorias',
        type: 'comparacion',
        title: 'Las inversiones en bolsa tienen mejor rendimiento',
        description: `${getCategoryLabel(best.type)} supera a ${getCategoryLabel(worst.type)} por ${(best.average - worst.average).toFixed(1)}% en ROI anualizado.`,
        priority: 7,
      });
    }
  }

  // Ordenar por prioridad y limitar a 3
  return insights
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3);
};

export const getInsightIcon = (type: InsightType): string => {
  switch (type) {
    case 'alerta':
      return '⚠️';
    case 'rendimiento':
      return '📉';
    case 'optimizacion':
      return '💡';
    case 'comparacion':
      return '📊';
    default:
      return '💰';
  }
};

export const getInsightColor = (type: InsightType): string => {
  switch (type) {
    case 'alerta':
      return 'text-red-400 bg-red-500/10 border-red-500/30';
    case 'rendimiento':
      return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    case 'optimizacion':
      return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    case 'comparacion':
      return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
    default:
      return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/30';
  }
};