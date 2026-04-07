import { useMemo } from 'react';

export interface Investment {
  id: string;
  name: string;
  type: string;
  investment_type: string;
  initial_value: number;
  current_value: number;
  monthly_contribution: number | null;
  start_date: string;
  risk_level?: string;
}

export interface LinkedIncome {
  id: string;
  amount: number;
  investment_id: string;
}

export interface InvestmentMetrics {
  cashflowMensual: number;
  paybackMeses: number | null;
  roiAnualizado: number;
  rendimiento: 'alto' | 'medio' | 'bajo';
  mesesActivos: number;
  ingresosTotales: number;
  revalorizacion: number;
  retornoTotal: number;
  roiTotal: number;
}

export interface PortfolioMetrics {
  totalPortfolioValue: number;
  totalReturn: number;
  totalROI: number;
  totalAccumulatedIncome: number;
  totalRevaluation: number;
  processedInvestments: (Investment & InvestmentMetrics & { linkedIncome: number; incomeCount: number })[];
  mejorInversion: Investment & InvestmentMetrics | null;
  promedioROIAnualizado: number;
}

const getMesesActivos = (startDate: string | null | undefined): number => {
  if (!startDate) return 1;
  const start = new Date(startDate + 'T00:00:00');
  const now = new Date();
  const diffTime = now.getTime() - start.getTime();
  const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));
  return Math.max(1, diffMonths);
};

const calcularRendimiento = (roiAnualizado: number, paybackMeses: number | null): 'alto' | 'medio' | 'bajo' => {
  if (roiAnualizado > 15 || (paybackMeses !== null && paybackMeses < 24)) {
    return 'alto';
  }
  if (roiAnualizado >= 5 || (paybackMeses !== null && paybackMeses >= 24 && paybackMeses <= 60)) {
    return 'medio';
  }
  return 'bajo';
};

export const useInvestmentMetrics = (
  investments: Investment[],
  incomes: LinkedIncome[]
): PortfolioMetrics => {
  return useMemo(() => {
    let totalPortfolioValue = 0;
    let totalInitialCapital = 0;
    let totalAccumulatedIncome = 0;
    let totalRevaluation = 0;

    const processedInvestments = investments.map((inv) => {
      const initial = parseFloat(String(inv.initial_value || 0));
      const current = parseFloat(String(inv.current_value || 0));
      
      const linkedIncomesList = incomes.filter(inc => inc.investment_id === inv.id);
      const linkedIncome = linkedIncomesList.reduce((sum, inc) => sum + parseFloat(String(inc.amount || 0)), 0);
      const incomeCount = linkedIncomesList.length;

      const mesesActivos = getMesesActivos(inv.start_date);
      const assetValue = inv.investment_type === 'revalorization' ? current : initial;
      
      const revalorizacion = current - initial;
      const retornoTotal = revalorizacion + linkedIncome;
      const roiTotal = initial > 0 ? (retornoTotal / initial) * 100 : 0;

      // Cashflow mensual (para inversiones income)
      const cashflowMensual = inv.investment_type === 'income' 
        ? linkedIncome / mesesActivos 
        : 0;

      // Payback (meses para recuperar inversión inicial)
      const paybackMeses = cashflowMensual > 0 
        ? initial / cashflowMensual 
        : null;

      // ROI Anualizado
      const years = mesesActivos / 12;
      const roiAnualizado = years > 0 && initial > 0 
        ? (Math.pow(1 + roiTotal / 100, 1 / years) - 1) * 100 
        : roiTotal;

      const rendimiento = calcularRendimiento(roiAnualizado, paybackMeses);

      totalPortfolioValue += assetValue;
      totalInitialCapital += initial;
      totalAccumulatedIncome += linkedIncome;
      totalRevaluation += revalorizacion;

      return {
        ...inv,
        assetValue,
        linkedIncome,
        incomeCount,
        mesesActivos,
        revalorizacion,
        retornoTotal,
        roiTotal,
        cashflowMensual,
        paybackMeses,
        roiAnualizado,
        rendimiento,
      };
    });

    const totalReturn = totalRevaluation + totalAccumulatedIncome;
    const totalROI = totalInitialCapital > 0 ? (totalReturn / totalInitialCapital) * 100 : 0;

    // Encontrar mejor inversión por ROI anualizado
    const mejorInversion = processedInvestments.length > 0
      ? processedInvestments.reduce((best, current) => 
          current.roiAnualizado > best.roiAnualizado ? current : best
        )
      : null;

    // Promedio de ROI anualizado
    const promedioROIAnualizado = processedInvestments.length > 0
      ? processedInvestments.reduce((sum, inv) => sum + inv.roiAnualizado, 0) / processedInvestments.length
      : 0;

    return {
      processedInvestments,
      totalPortfolioValue,
      totalReturn,
      totalROI,
      totalAccumulatedIncome,
      totalRevaluation,
      mejorInversion,
      promedioROIAnualizado,
    };
  }, [investments, incomes]);
};

export const getCategoryAverageROI = (
  investments: (Investment & InvestmentMetrics)[],
  category: string
): number => {
  const categoryInvestments = investments.filter(inv => inv.type === category);
  if (categoryInvestments.length === 0) return 0;
  return categoryInvestments.reduce((sum, inv) => sum + inv.roiAnualizado, 0) / categoryInvestments.length;
};