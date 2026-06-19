"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/utils/currency";
import { getMonthlyAmount } from "@/utils/recurrence";
import YearMonthPicker from "./YearMonthPicker";
import { useExpensesTotal } from "@/hooks/useExpensesTotal";
import { useDateFilter } from "@/contexts/DateFilterContext";

interface FinancialSummaryProps {
  navigate?: (path: string) => void;
}

const FinancialSummary: React.FC<FinancialSummaryProps> = ({
  navigate,
}) => {
  const [incomes, setIncomes] = useState<any[]>([]);
  const [loadingIncomes, setLoadingIncomes] = useState(true);
  
  // Use global date filter context
  const { filterMonth: selectedMonth, filterYear: selectedYear, setFilterMonth, setFilterYear } = useDateFilter();
  
  // Use the unified hook for expenses and loans calculation
  const { totalWithLoans, loading: loadingExpenses } = useExpensesTotal(selectedMonth, selectedYear);

  useEffect(() => {
    fetchIncomes();
  }, [selectedMonth, selectedYear]);

  const fetchIncomes = async () => {
    setLoadingIncomes(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      setLoadingIncomes(false);
      return;
    }

    const year = selectedYear;
    const startDate = `${year}-${selectedMonth}-01`;
    
    // Calculate the actual last day of the month
    const lastDay = new Date(parseInt(selectedYear), parseInt(selectedMonth), 0).getDate();
    const endDate = `${year}-${selectedMonth}-${lastDay}`;

    // Fetch incomes for the selected month and year (including recurrence fields)
    const incomesResult = await supabase
      .from("incomes")
      .select("amount, date, is_recurring, frequency, recurrence_interval, recurrence_unit, start_date, is_skipped")
      .eq("user_id", session.user.id)
      .gte("date", startDate)
      .lte("date", endDate);
    
    // Filtrar ingresos en el cliente para excluir solo los saltos (is_skipped)
    // NO filtrar plantillas - IncomePage.tsx tampoco lo hace
    let filteredIncomes = incomesResult.data || [];
    filteredIncomes = filteredIncomes.filter((i: any) => {
      if (i.is_skipped) return false; // Ingresos saltados, excluir
      return true;
    });
    
    setIncomes(filteredIncomes);
    setLoadingIncomes(false);
  };

  // Total incomes for the selected month (considering recurrence)
  const totalIncome = incomes.reduce((sum, i) => {
    const amount = i.is_recurring
      ? getMonthlyAmount(parseFloat(i.amount || 0), i.frequency, i.recurrence_interval, i.recurrence_unit)
      : parseFloat(i.amount || 0);
    return sum + amount;
  }, 0);
  
  // Balance = Ingresos - Gastos (usando totalWithLoans del hook)
  const balance = totalIncome - totalWithLoans;
  
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
      {/* Fila 1: Selectores de Año y Mes - Ahora con cuadrícula */}
      <YearMonthPicker
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        setSelectedMonth={setFilterMonth}
        setSelectedYear={setFilterYear}
      />

      {/* Fila 2: Botones de Acción */}
      <div className="grid grid-cols-2 gap-6">
        <Button 
          onClick={handleNewIncome}
          className="bg-green-500 hover:bg-green-600 text-black py-6 text-base font-semibold rounded-xl"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Ingreso
        </Button>
        <Button 
          onClick={handleNewExpense}
          className="bg-red-500 hover:bg-red-600 text-white py-6 text-base font-semibold rounded-xl"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Gasto
        </Button>
      </div>

      {/* Fila 3: Ingresos / Gastos */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
              <span className="text-xs sm:text-sm text-green-400 font-medium">Ingresos</span>
            </div>
            {loadingIncomes ? (
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-t-2 border-b-2 border-green-500"></div>
            ) : (
              <p className="text-2xl sm:text-3xl font-bold text-white text-center">
                {formatCurrency(totalIncome)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-3">
              <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
              <span className="text-xs sm:text-sm text-red-400 font-medium">Gastos</span>
            </div>
            {loadingExpenses ? (
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-t-2 border-b-2 border-red-500"></div>
            ) : (
              <p className="text-2xl sm:text-3xl font-bold text-white text-center">
                {formatCurrency(totalWithLoans)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Fila 4: Balance / Tasa de Ahorro */}
      <div className="grid grid-cols-2 gap-6">
        <Card className={`${balance >= 0 ? "bg-zinc-900" : "bg-red-900/20"} border ${balance >= 0 ? "border-zinc-800" : "border-red-800"}`}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-3">
              <DollarSign className={`w-5 h-5 sm:w-6 sm:h-6 ${balance >= 0 ? "text-green-500" : "text-red-500"}`} />
              <span className={`text-xs sm:text-sm font-medium ${balance >= 0 ? "text-green-400" : "text-red-400"}`}>Balance</span>
            </div>
            {loadingIncomes || loadingExpenses ? (
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-t-2 border-b-2 border-green-500"></div>
            ) : (
              <p className={`text-2xl sm:text-3xl font-bold text-center ${balance >= 0 ? "text-green-500" : "text-red-500"}`}>
                {formatCurrency(balance)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-3">
              <PiggyBank className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
              <span className="text-xs sm:text-sm text-green-400 font-medium">Tasa de Ahorro</span>
            </div>
            {loadingIncomes || loadingExpenses ? (
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-t-2 border-b-2 border-green-500"></div>
            ) : (
              <p className="text-2xl sm:text-3xl font-bold text-white text-center">
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
