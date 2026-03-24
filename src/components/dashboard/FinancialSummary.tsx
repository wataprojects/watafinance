"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

interface FinancialSummaryProps {
  selectedMonth: string;
  selectedYear: string;
  setSelectedMonth?: (month: string) => void;
  setSelectedYear?: (year: string) => void;
  navigate?: (path: string) => void;
}

const FinancialSummary: React.FC<FinancialSummaryProps> = ({
  selectedMonth,
  selectedYear,
  navigate,
}) => {
  const [incomes, setIncomes] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

    const year = selectedYear;
    const startDate = `${year}-${selectedMonth}-01`;
    const endDate = `${year}-${selectedMonth}-31`;

    // Fetch incomes for the selected month and year
    const incomesResult = await supabase
      .from("incomes")
      .select("amount, date")
      .eq("user_id", session.user.id)
      .gte("date", startDate)
      .lte("date", endDate);

    // Fetch expenses for the selected month and year
    const expensesResult = await supabase
      .from("expenses")
      .select("amount, date")
      .eq("user_id", session.user.id)
      .gte("date", startDate)
      .lte("date", endDate);

    // Fetch active loans for the user
    const loansResult = await supabase
      .from("loans")
      .select("monthly_payment, status")
      .eq("user_id", session.user.id)
      .eq("status", "active");

    if (incomesResult.data) setIncomes(incomesResult.data);
    if (expensesResult.data) setExpenses(expensesResult.data);
    if (loansResult.data) setLoans(loansResult.data);
    setLoading(false);
  };

  // Total incomes for the selected month
  const totalIncome = incomes.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
  
  // Total expenses for the selected month
  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  
  // Total loans monthly payment (only active loans)
  const totalLoansMonthly = loans.reduce((sum, loan) => sum + parseFloat(loan.monthly_payment || 0), 0);
  
  // Total gastos = expenses + loans monthly payment
  const totalGastos = totalExpenses + totalLoansMonthly;
  
  // Balance = Ingresos - Gastos
  const balance = totalIncome - totalGastos;
  
  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100) : 0;

  const handleNewIncome = () => {
    if (navigate) {
      navigate("/dashboard/income");
    }
  };

  const handleNewExpense = () => {
    if (navigate) {
      navigate("/dashboard/expenses");
    }
  };

  return (
    <div className="space-y-6">
      {/* Fila 1: Botones de Acción */}
      <div className="grid grid-cols-2 gap-6">
        <Button 
          onClick={handleNewIncome}
          className="bg-green-500 hover:bg-green-600 text-black py-6 text-base font-semibold"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Ingreso
        </Button>
        <Button 
          onClick={handleNewExpense}
          className="bg-red-500 hover:bg-red-600 text-white py-6 text-base font-semibold"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Gasto
        </Button>
      </div>

      {/* Fila 2: Ingresos / Gastos */}
      <div className="grid grid-cols-2 gap-6">
        {/* Card de Ingresos - Fondo con gradiente, contenedor de icono mejorado */}
        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800/50 border-zinc-700/50 overflow-hidden relative">
          {/* Shine effect */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              {/* Contenedor de icono con círculo */}
              <div className="w-12 h-12 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <p className="text-green-400/80 text-xs uppercase tracking-wide font-medium mb-1">Ingresos</p>
            {loading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
            ) : (
              <p className="text-3xl font-bold text-white">
                {formatCurrency(totalIncome)}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Card de Gastos - Fondo con gradiente rojo */}
        <Card className="bg-gradient-to-br from-zinc-900 to-red-950/30 border-red-500/20 overflow-hidden relative">
          {/* Shine effect */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              {/* Contenedor de icono con círculo */}
              <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-400" />
              </div>
            </div>
            <p className="text-red-400/80 text-xs uppercase tracking-wide font-medium mb-1">Gastos</p>
            {loading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
            ) : (
              <p className="text-3xl font-bold text-white">
                {formatCurrency(totalGastos)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Fila 3: Balance / Tasa de Ahorro */}
      <div className="grid grid-cols-2 gap-6">
        {/* Card de Balance - Gradiente condicional según signo */}
        <Card className={`overflow-hidden relative ${
          balance >= 0 
            ? "bg-gradient-to-br from-zinc-900 to-green-950/30 border-green-500/20" 
            : "bg-gradient-to-br from-zinc-900 to-red-950/30 border-red-500/20"
        }`}>
          {/* Shine effect condicional */}
          <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 ${
            balance >= 0 ? "bg-green-500/5" : "bg-red-500/5"
          }`}></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              {/* Contenedor de icono con círculo - color condicional */}
              <div className={`w-12 h-12 rounded-full border flex items-center justify-center ${
                balance >= 0 
                  ? "bg-green-500/20 border-green-500/30" 
                  : "bg-red-500/20 border-red-500/30"
              }`}>
                <DollarSign className={`w-6 h-6 ${balance >= 0 ? "text-green-400" : "text-red-400"}`} />
              </div>
            </div>
            <p className={`text-xs uppercase tracking-wide font-medium mb-1 ${
              balance >= 0 ? "text-green-400/80" : "text-red-400/80"
            }`}>Balance</p>
            {loading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
            ) : (
              <p className={`text-3xl font-bold ${
                balance >= 0 ? "text-green-500" : "text-red-500"
              }`}>
                {balance >= 0 ? "+" : ""}{formatCurrency(balance)}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Card de Tasa de Ahorro - Fondo con gradiente verde */}
        <Card className="bg-gradient-to-br from-zinc-900 to-green-950/30 border-green-500/20 overflow-hidden relative">
          {/* Shine effect */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              {/* Contenedor de icono con círculo */}
              <div className="w-12 h-12 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                <PiggyBank className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <p className="text-green-400/80 text-xs uppercase tracking-wide font-medium mb-1">Tasa de Ahorro</p>
            {loading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
            ) : (
              <p className="text-3xl font-bold text-white">
                {savingsRate.toFixed(1)}%
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialSummary;