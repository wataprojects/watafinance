"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Zap, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/utils/currency";

interface FinancialFreedomProps {
  selectedMonth: string;
  selectedYear: string;
}

const FinancialFreedom: React.FC<FinancialFreedomProps> = ({ selectedMonth, selectedYear }) => {
  const [loading, setLoading] = useState(true);
  const [incomes, setIncomes] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [patrimony, setPatrimony] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [debts, setDebts] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const fetchData = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      setLoading(false);
      return;
    }

    // Calcular correctamente el último día del mes
    const year = parseInt(selectedYear);
    const month = parseInt(selectedMonth);
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    
    const startDate = `${year}-${selectedMonth}-01`;
    const endDate = `${year}-${selectedMonth}-${lastDayOfMonth.toString().padStart(2, '0')}`;

    // Fetch incomes for selected month
    const incomesResult = await supabase
      .from("incomes")
      .select("amount, is_passive")
      .eq("user_id", session.user.id)
      .gte("date", startDate)
      .lte("date", endDate);

    // Fetch expenses for selected month
    const expensesResult = await supabase
      .from("expenses")
      .select("amount")
      .eq("user_id", session.user.id)
      .gte("date", startDate)
      .lte("date", endDate);

    // Fetch active loans for monthly payments
    const loansResult = await supabase
      .from("loans")
      .select("monthly_payment")
      .eq("user_id", session.user.id)
      .eq("status", "active");

    // Fetch all-time data for net worth
    const [patrimonyResult, investmentsResult, debtsResult] = await Promise.all([
      supabase.from("patrimony").select("value").eq("user_id", session.user.id),
      supabase.from("investments").select("current_value").eq("user_id", session.user.id),
      supabase.from("debts").select("current_amount").eq("user_id", session.user.id)
    ]);

    if (incomesResult.data) setIncomes(incomesResult.data);
    if (expensesResult.data) setExpenses(expensesResult.data);
    if (loansResult.data) setLoans(loansResult.data);
    if (patrimonyResult.data) setPatrimony(patrimonyResult.data);
    if (investmentsResult.data) setInvestments(investmentsResult.data);
    if (debtsResult.data) setDebts(debtsResult.data);
    setLoading(false);
  };

  // Calculate monthly data
  const passiveIncome = incomes.filter(i => i.is_passive).reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
  const activeIncome = incomes.filter(i => !i.is_passive).reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
  
  // Calcular gastos mensuales incluyendo préstamos
  const monthlyExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const loansMonthlyPayment = loans.reduce((sum, loan) => sum + parseFloat(loan.monthly_payment || 0), 0);
  const totalMonthlyExpenses = monthlyExpenses + loansMonthlyPayment;
  
  // Calculate coverage percentage (what % of monthly expenses are covered by passive income)
  const coveragePercentage = totalMonthlyExpenses > 0 ? Math.min(100, Math.round((passiveIncome / totalMonthlyExpenses) * 100)) : 0;
  
  // Calculate net worth (all-time)
  const totalPatrimony = patrimony.reduce((sum, p) => sum + parseFloat(p.value || 0), 0);
  const totalInvestments = investments.reduce((sum, i) => sum + parseFloat(i.current_value || 0), 0);
  const totalDebts = debts.reduce((sum, d) => sum + parseFloat(d.current_amount || 0), 0);
  const currentNetWorth = totalPatrimony + totalInvestments - totalDebts;
  
  // Calculate needed passive income to cover all expenses
  const neededPassiveIncome = Math.max(0, totalMonthlyExpenses - passiveIncome);

  // Get month name
  const months = [
    { value: "01", label: "Enero" },
    { value: "02", label: "Febrero" },
    { value: "03", label: "Marzo" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Mayo" },
    { value: "06", label: "Junio" },
    { value: "07", label: "Julio" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ];
  const monthLabel = months.find(m => m.value === selectedMonth)?.label || "";

  // Get motivational message based on coverage
  const getCoverageMessage = () => {
    if (coveragePercentage === 0) return "¡Añade tus primeros ingresos pasivos!";
    if (coveragePercentage < 25) return "Cada paso cuenta, ¡sigue así!";
    if (coveragePercentage < 50) return "¡Ya cubres una buena parte!";
    if (coveragePercentage < 75) return "¡Estás muy cerca de la libertad!";
    if (coveragePercentage < 100) return "¡Casi lo tienes, un poco más!";
    return "🎉 ¡Felicidades! Cubres todos tus gastos";
  };

  return (
    <Card className="bg-gradient-to-r from-green-900 to-zinc-900 border-green-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-white">
            <Target className="w-5 h-5 text-green-400" />
            Progreso hacia Libertad
          </CardTitle>
        </div>
        <p className="text-xs text-green-400/70 mt-1">{monthLabel}</p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <>
            {/* Círculo principal - Percentage Coverage */}
            <div className="flex justify-center my-4">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
                  <circle
                    cx="80" cy="80" r="70"
                    fill="none"
                    stroke="url(#greenGradient)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${Math.min(coveragePercentage, 100) * 4.4} 440`}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-green-400">{coveragePercentage}%</span>
                  <span className="text-xs text-white/60 text-center px-2">Tus ingresos pasivos cubren un {coveragePercentage}% de tus gastos</span>
                </div>
              </div>
            </div>

            {/* Mensaje motivador */}
            <div className="text-center mb-4">
              <p className="text-sm font-medium text-green-300">
                {getCoverageMessage()}
              </p>
            </div>

            {/* Stats grid - 2 columnas: Pasivos y Activos */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="text-center p-3 bg-white/5 rounded-xl">
                <Zap className="w-5 h-5 mx-auto mb-1 text-yellow-400" />
                <p className="text-xs text-white/50">Pasivos</p>
                <p className="font-bold text-white text-sm">{formatCurrency(passiveIncome)}</p>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-xl">
                <Briefcase className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                <p className="text-xs text-white/50">Activos</p>
                <p className="font-bold text-white text-sm">{formatCurrency(activeIncome)}</p>
              </div>
            </div>

            {/* Información de préstamos */}
            {loansMonthlyPayment > 0 && (
              <div className="mt-3 pt-3 border-t border-green-800">
                <div className="flex justify-between text-xs">
                  <span className="text-white/50">Gastos: </span>
                  <span className="text-white">{formatCurrency(monthlyExpenses)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/50">Préstamos: </span>
                  <span className="text-cyan-400">{formatCurrency(loansMonthlyPayment)}/mes</span>
                </div>
                <div className="flex justify-between text-xs font-medium mt-1 pt-1 border-t border-green-800/50">
                  <span className="text-white">Total: </span>
                  <span className="text-white">{formatCurrency(totalMonthlyExpenses)}</span>
                </div>
              </div>
            )}

            {/* Necesitas X€/mes pasivos para cubrir todos tus gastos */}
            <div className="mt-4 pt-4 border-t border-green-800">
              <p className="text-xs text-white/50 text-center">
                Necesitas <span className="text-green-400 font-bold">{formatCurrency(neededPassiveIncome)}/mes</span> pasivos para cubrir todos tus gastos
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default FinancialFreedom;