"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown,
  Target,
  Zap,
  PiggyBank,
  Banknote,
  ArrowUpRight,
  DollarSign,
  AlertCircle,
  Lightbulb,
  BarChart3,
  Wallet
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

interface Metric {
  name: string;
  score: number;
  value: number;
  icon: React.ReactNode;
  description: string;
}

interface Insights {
  fortalezas: string[];
  riesgos: string[];
  recomendaciones: string[];
}

// Función para obtener el mes anterior
const getPreviousMonth = (year: number, month: number) => {
  if (month === 1) {
    return { year: year - 1, month: 12 };
  }
  return { year, month: month - 1 };
};

// Función para formatear mes/año
const formatMonthYear = (year: number, month: number) => {
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  return `${months[month - 1]} ${year}`;
};

const FinancialHealth = () => {
  const [loading, setLoading] = useState(true);
  const [noData, setNoData] = useState(false);
  const [currentMonthData, setCurrentMonthData] = useState<any>(null);
  const [previousMonthData, setPreviousMonthData] = useState<any>(null);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [insights, setInsights] = useState<Insights>({ fortalezas: [], riesgos: [], recomendaciones: [] });
  const [score, setScore] = useState(0);
  const [previousScore, setPreviousScore] = useState(0);
  const [trend, setTrend] = useState<number>(0);
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      setLoading(false);
      return;
    }

    const year = currentYear;
    const month = currentMonth;
    const prevMonthData = getPreviousMonth(year, month);

    // Fetch current month data
    const currentData = await fetchMonthData(session.user.id, year, month);
    // Fetch previous month data
    const prevData = await fetchMonthData(session.user.id, prevMonthData.year, prevMonthData.month);

    setCurrentMonthData(currentData);
    setPreviousMonthData(prevData);

    // Check if user has any data
    if (!currentData.hasData) {
      setNoData(true);
      setLoading(false);
      return;
    }

    setNoData(false);

    // Calculate metrics
    const calculatedMetrics = calculateMetrics(currentData);
    setMetrics(calculatedMetrics);

    // Generate insights
    const generatedInsights = generateInsights(calculatedMetrics, currentData);
    setInsights(generatedInsights);

    // Calculate score
    const calculatedScore = calculateScore(calculatedMetrics);
    setScore(Math.round(calculatedScore));

    // Calculate previous score if we have data
    if (prevData.hasData) {
      const prevMetrics = calculateMetrics(prevData);
      const prevScore = calculateScore(prevMetrics);
      setPreviousScore(Math.round(prevScore));
      setTrend(Math.round(calculatedScore - prevScore));
    } else {
      setPreviousScore(0);
      setTrend(0);
    }

    setLoading(false);
  };

  const fetchMonthData = async (userId: string, year: number, month: number) => {
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDayOfMonth.toString().padStart(2, '0')}`;

    // Fetch incomes for the month
    const incomesResult = await supabase
      .from("incomes")
      .select("amount, is_passive, is_recurring")
      .eq("user_id", userId)
      .gte("date", startDate)
      .lte("date", endDate);

    // Fetch expenses for the month
    const expensesResult = await supabase
      .from("expenses")
      .select("amount")
      .eq("user_id", userId)
      .gte("date", startDate)
      .lte("date", endDate);

    // Fetch active loans for monthly payments
    const loansResult = await supabase
      .from("loans")
      .select("monthly_payment")
      .eq("user_id", userId)
      .eq("status", "active");

    const incomes = incomesResult.data || [];
    const expenses = expensesResult.data || [];
    const loans = loansResult.data || [];

    const totalIncome = incomes.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const loansMonthly = loans.reduce((sum, l) => sum + parseFloat(l.monthly_payment || 0), 0);
    const totalExpensesWithLoans = totalExpenses + loansMonthly;
    
    const passiveIncome = incomes.filter(i => i.is_passive).reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
    const activeIncome = incomes.filter(i => !i.is_passive).reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
    const recurringIncome = incomes.filter(i => i.is_recurring).reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);

    // Fetch all-time debt data for load calculation
    const allDebtsResult = await supabase
      .from("debts")
      .select("current_amount")
      .eq("user_id", userId);

    const allDebts = allDebtsResult.data || [];
    const totalDebtAmount = allDebts.reduce((sum, d) => sum + parseFloat(d.current_amount || 0), 0);

    const hasData = incomes.length > 0 || expenses.length > 0;

    return {
      hasData,
      totalIncome,
      totalExpenses,
      loansMonthly,
      totalExpensesWithLoans,
      passiveIncome,
      activeIncome,
      recurringIncome,
      totalDebtAmount,
      netBalance: totalIncome - totalExpensesWithLoans,
    };
  };

  const calculateMetrics = (data: any): Metric[] => {
    const {
      totalIncome,
      totalExpensesWithLoans,
      passiveIncome,
      loansMonthly,
      recurringIncome,
      totalDebtAmount,
      netBalance,
    } = data;

    // 1. Balance mensual (25% weight)
    // Score based on: if positive = 100, if negative scales from 100 to 0
    const balancePercentage = totalIncome > 0 ? (netBalance / totalIncome) * 100 : 0;
    const balanceScore = totalIncome > 0 
      ? Math.max(0, Math.min(100, balancePercentage + 50)) // Shift so 0% balance = 50 score
      : 50;

    // 2. Ratio de ahorro (20% weight)
    // Same as balance but expressed as savings rate
    const savingsRate = totalIncome > 0 ? (netBalance / totalIncome) * 100 : 0;
    const savingsScore = totalIncome > 0 
      ? Math.max(0, Math.min(100, (savingsRate + 50))) // 0% savings = 50 score, 50%+ = 100
      : 50;

    // 3. Cobertura de ingresos pasivos (20% weight)
    // What % of expenses are covered by passive income
    const passiveCoverage = totalExpensesWithLoans > 0 
      ? Math.min(100, (passiveIncome / totalExpensesWithLoans) * 100)
      : 0;
    const passiveScore = passiveCoverage;

    // 4. Carga de deuda (20% weight)
    // Lower debt payment relative to income is better
    const debtLoadPercentage = totalIncome > 0 ? (loansMonthly / totalIncome) * 100 : 0;
    // Invert: 0% debt = 100 score, 50%+ debt = 0 score
    const debtScore = totalIncome > 0 
      ? Math.max(0, 100 - (debtLoadPercentage * 2))
      : 100;

    // 5. Estabilidad (15% weight)
    // What % of income is recurring
    const stabilityPercentage = totalIncome > 0 
      ? (recurringIncome / totalIncome) * 100 
      : 0;
    const stabilityScore = stabilityPercentage;

    return [
      {
        name: "Balance mensual",
        score: Math.round(balanceScore),
        value: netBalance,
        icon: <Wallet className="w-4 h-4" />,
        description: "Diferencia entre ingresos y gastos"
      },
      {
        name: "Ratio de ahorro",
        score: Math.round(savingsScore),
        value: savingsRate,
        icon: <PiggyBank className="w-4 h-4" />,
        description: "Porcentaje de ingresos que ahorras"
      },
      {
        name: "Ingresos pasivos",
        score: Math.round(passiveScore),
        value: passiveCoverage,
        icon: <Zap className="w-4 h-4" />,
        description: "Cobertura de gastos con ingresos pasivos"
      },
      {
        name: "Carga de deuda",
        score: Math.round(debtScore),
        value: debtLoadPercentage,
        icon: <Banknote className="w-4 h-4" />,
        description: "Presión de préstamos en tus ingresos"
      },
      {
        name: "Estabilidad",
        score: Math.round(stabilityScore),
        value: stabilityPercentage,
        icon: <Shield className="w-4 h-4" />,
        description: "Porcentaje de ingresos recurrentes"
      },
    ];
  };

  const calculateScore = (metrics: Metric[]): number => {
    const weights = [0.25, 0.20, 0.20, 0.20, 0.15];
    const metricScores = metrics.map(m => m.score);
    
    return metricScores.reduce((sum, score, index) => {
      return sum + (score * weights[index]);
    }, 0);
  };

  const generateInsights = (metrics: Metric[], data: any): Insights => {
    const fortalezas: string[] = [];
    const riesgos: string[] = [];
    const recomendaciones: string[] = [];

    // Check each metric for insights
    const [balance, savings, passive, debt, stability] = metrics;

    // Fortalezas (score > 70)
    if (balance.score >= 70) {
      fortalezas.push("Tienes buen control de tus gastos mensuales");
    }
    if (savings.score >= 70) {
      fortalezas.push("Excelente capacidad de ahorro");
    }
    if (passive.score >= 70) {
      fuertezas.push("Buena independencia financiera gracias a ingresos pasivos");
    }
    if (debt.score >= 70) {
      fuertezas.push("Baja presión de deudas en tus finanzas");
    }
    if (stability.score >= 70) {
      fortalezas.push("Tus ingresos son muy estables");
    }

    // Riesgos (score < 40)
    if (balance.score < 40 && data.totalIncome > 0) {
      riesgos.push("Tu balance mensual es negativo");
    }
    if (savings.score < 40 && data.totalIncome > 0) {
      riesgos.push("Baja capacidad de ahorro");
    }
    if (passive.score < 40 && data.totalIncome > 0) {
      riesgos.push("Dependes demasiado de ingresos activos");
    }
    if (debt.score < 40 && data.totalIncome > 0) {
      riesgos.push("Alta presión de deudas en tus ingresos");
    }
    if (stability.score < 40 && data.totalIncome > 0) {
      riesgos.push("Tus ingresos son muy variables");
    }

    // Recomendaciones (based on lowest scores)
    const lowestMetric = [...metrics].sort((a, b) => a.score - b.score)[0];
    
    if (lowestMetric.name === "Balance mensual" && lowestMetric.score < 50) {
      recomendaciones.push("Reduce gastos en categorías no esenciales");
    }
    if (lowestMetric.name === "Ratio de ahorro" && lowestMetric.score < 40) {
      recomendaciones.push("Intenta ahorrar al menos el 10% de tus ingresos");
    }
    if (lowestMetric.name === "Ingresos pasivos" && lowestMetric.score < 30) {
      recomendaciones.push("Considera crear fuentes de ingreso pasivo");
    }
    if (lowestMetric.name === "Carga de deuda" && lowestMetric.score < 40) {
      recomendaciones.push("Prioriza pagar deudas de alto interés");
    }
    if (lowestMetric.name === "Estabilidad" && lowestMetric.score < 50) {
      recomendaciones.push("Busca fuentes de ingreso más estables");
    }

    // Add general recommendations if none generated
    if (recomendaciones.length === 0 && data.totalIncome > 0) {
      if (savings.score < 60) {
        recomendaciones.push("Continúa mejorando tu tasa de ahorro");
      }
      if (passive.score < 50) {
        recomendaciones.push("Considera diversificar hacia ingresos pasivos");
      }
    }

    // Limit to 3 items per section
    return {
      fortalezas: fortalezas.slice(0, 3),
      riesgos: riesgos.slice(0, 3),
      recomendaciones: recomendaciones.slice(0, 3),
    };
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return { main: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" };
    if (score >= 60) return { main: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
    if (score >= 40) return { main: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" };
    return { main: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" };
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excelente";
    if (score >= 60) return "Bueno";
    if (score >= 40) return "Regular";
    return "En Riesgo";
  };

  const getMetricColor = (metricScore: number) => {
    if (metricScore >= 70) return "bg-green-500";
    if (metricScore >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (loading) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
        </CardContent>
      </Card>
    );
  }

  if (noData) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-white">
            <Heart className="w-5 h-5 text-green-500" />
            Estado Salud Financiera Mensual
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-zinc-500" />
          </div>
          <h3 className="text-white font-medium mb-2">Sin datos suficientes</h3>
          <p className="text-zinc-400 text-sm">
            Agrega tus ingresos y gastos para ver tu diagnóstico financiero
          </p>
        </CardContent>
      </Card>
    );
  }

  const scoreStyle = getScoreColor(score);

  return (
    <Card className={`bg-zinc-900 border-zinc-800 ${scoreStyle.bg}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-white">
            <Target className="w-5 h-5 text-green-500" />
            Estado Salud Financiera Mensual
          </CardTitle>
          <div className="text-xs text-zinc-400">
            {formatMonthYear(currentYear, currentMonth)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Score Circle */}
        <div className="flex flex-col items-center py-4">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90">
              <circle 
                cx="64" 
                cy="64" 
                r="58" 
                fill="none" 
                stroke="rgba(255,255,255,0.1)" 
                strokeWidth="8" 
              />
              <circle
                cx="64"
                cy="64"
                r="58"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${Math.min(score, 100) * 3.64} 364`}
                className={`${scoreStyle.main} transition-all duration-1000`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-bold ${scoreStyle.main}`}>{score}</span>
              <span className="text-xs text-zinc-400">/ 100</span>
            </div>
          </div>
          
          <div className="mt-3 flex items-center gap-2">
            <span className={`text-lg font-medium ${scoreStyle.main}`}>
              {getScoreLabel(score)}
            </span>
            {trend !== 0 && (
              <div className={`flex items-center gap-1 text-sm ${trend > 0 ? "text-green-400" : "text-red-400"}`}>
                {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{trend > 0 ? "+" : ""}{trend} vs mes anterior</span>
              </div>
            )}
          </div>
        </div>

        {/* Metrics Bars */}
        <div className="space-y-4">
          {metrics.map((metric, index) => (
            <div key={metric.name} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={metric.score >= 50 ? "text-zinc-300" : "text-red-400"}>
                    {metric.icon}
                  </span>
                  <span className="text-sm text-zinc-300">{metric.name}</span>
                </div>
                <span className={`text-sm font-bold ${metric.score >= 50 ? "text-zinc-300" : "text-red-400"}`}>
                  {metric.score}
                </span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${getMetricColor(metric.score)}`}
                  style={{ width: `${metric.score}%`, animationDelay: `${index * 100}ms` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Insights Sections */}
        <div className="space-y-4 pt-4 border-t border-zinc-800">
          {/* Fortalezas */}
          {insights.fortalezas.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-green-400">Fortalezas</span>
              </div>
              <div className="space-y-1.5">
                {insights.fortalezas.map((fortaleza, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm text-zinc-300">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>{fortaleza}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Riesgos */}
          {insights.riesgos.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-yellow-400">Riesgos</span>
              </div>
              <div className="space-y-1.5">
                {insights.riesgos.map((riesgo, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm text-zinc-300">
                    <span className="text-yellow-500 mt-0.5">•</span>
                    <span>{riesgo}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recomendaciones */}
          {insights.recomendaciones.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">Recomendaciones</span>
              </div>
              <div className="space-y-1.5">
                {insights.recomendaciones.map((recomendacion, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm text-zinc-300">
                    <ArrowUpRight className="w-3 h-3 text-blue-500 mt-0.5" />
                    <span>{recomendacion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialHealth;