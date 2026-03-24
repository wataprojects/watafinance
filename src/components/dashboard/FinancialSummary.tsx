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
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-6 h-6 text-green-500" />
              <span className="text-sm text-green-400 font-medium">Ingresos</span>
            </div>
            {loading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
            ) : (
              <p className="text-3xl font-bold text-white">
                {formatCurrency(totalIncome)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <TrendingDown className="w-6 h-6 text-red-500" />
              <span className="text-sm text-red-400 font-medium">Gastos</span>
            </div>
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
        <Card className={`${balance >= 0 ? "bg-zinc-900" : "bg-red-900/20"} border ${balance >= 0 ? "border-zinc-800" : "border-red-800"}`}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <DollarSign className={`w-6 h-6 ${balance >= 0 ? "text-green-500" : "text-red-500"}`} />
              <span className={`text-sm font-medium ${balance >= 0 ? "text-green-400" : "text-red-400"}`}>Balance</span>
            </div>
            {loading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
            ) : (
              <p className={`text-2xl font-bold ${balance >= 0 ? "text-green-500" : "text-red-500"}`}>
                {balance >= 0 ? "+" : ""}{formatCurrency(balance)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <PiggyBank className="w-6 h-6 text-green-500" />
              <span className="text-sm text-green-400 font-medium">Tasa de Ahorro</span>
            </div>
            {loading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
            ) : (
              <p className="text-2xl font-bold text-white">
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