"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/utils/currency";
import YearMonthPicker from "./YearMonthPicker";

interface FinancialSummaryProps {
  selectedMonth: string;
  selectedYear: string;
  setSelectedMonth?: (month: string) => void;
  setSelectedYear?: (year: string) => void;
  navigate?: (path: string) => void;
}

const getMonthlyAmount = (amount: number, frequency: string, recurrenceInterval?: number, recurrenceUnit?: string): number => {
  const numAmount = parseFloat(String(amount)) || 0;
  switch (frequency) {
    case 'weekly': return numAmount * 4.33;
    case 'monthly': return numAmount;
    case 'quarterly': return numAmount / 3;
    case 'annual': return numAmount / 12;
    case 'custom':
      if (recurrenceUnit === 'days') return (numAmount * 30) / (recurrenceInterval || 1);
      if (recurrenceUnit === 'weeks') return (numAmount * 4.33) / (recurrenceInterval || 1);
      if (recurrenceUnit === 'months') return numAmount / (recurrenceInterval || 1);
      return numAmount;
    default: return numAmount;
  }
};

const FinancialSummary: React.FC<FinancialSummaryProps> = ({
  selectedMonth,
  selectedYear,
  setSelectedMonth,
  setSelectedYear,
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

    // Fetch expenses for the selected month and year (including recurrence fields)
    // Las plantillas recurrentes se excluyen en el filtro del cliente (start_date === date)
    const expensesResult = await supabase
      .from("expenses")
      .select("amount, date, is_recurring, start_date, frequency, recurrence_interval, recurrence_unit")
      .eq("user_id", session.user.id)
      .gte("date", startDate)
      .lte("date", endDate);
    
    // Filtrar gastos en el cliente para excluir plantillas recurrentes
    // Las ocurrencias generadas tienen start_date diferente a su date (la fecha de creación de la plantilla)
    let filteredExpenses = expensesResult.data || [];
    filteredExpenses = filteredExpenses.filter((e: any) => {
      if (!e.is_recurring) return true; // Gastos no recurrentes siempre incluidos
      if (!e.start_date) return false; // Sin start_date = plantilla original, excluir
      if (e.start_date === e.date) return false; // start_date igual a date = plantilla original, excluir
      return true; // Es una ocurrencia generada, incluir
    });
    
    // Filtrar ingresos en el cliente para excluir solo los saltos (is_skipped)
    // NO filtrar plantillas - IncomePage.tsx tampoco lo hace
    let filteredIncomes = incomesResult.data || [];
    filteredIncomes = filteredIncomes.filter((i: any) => {
      if (i.is_skipped) return false; // Ingresos saltados, excluir
      return true;
    });
    
    setExpenses(filteredExpenses);
    setIncomes(filteredIncomes);

    // Fetch active loans for the user
    const loansResult = await supabase
      .from("loans")
      .select("monthly_payment, status")
      .eq("user_id", session.user.id)
      .eq("status", "active");

    if (loansResult.data) setLoans(loansResult.data);
    setLoading(false);
  };

  // Total incomes for the selected month (considering recurrence)
  const totalIncome = incomes.reduce((sum, i) => {
    const amount = i.is_recurring
      ? getMonthlyAmount(parseFloat(i.amount || 0), i.frequency, i.recurrence_interval, i.recurrence_unit)
      : parseFloat(i.amount || 0);
    return sum + amount;
  }, 0);
  
  // Total expenses for the selected month (considering recurrence)
  const totalExpenses = expenses.reduce((sum, e) => {
    const amount = e.is_recurring
      ? getMonthlyAmount(parseFloat(e.amount), e.frequency, e.recurrence_interval, e.recurrence_unit)
      : parseFloat(e.amount);
    return sum + amount;
  }, 0);
  
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
      {/* Fila 1: Selectores de Año y Mes - Ahora con cuadrícula */}
      <YearMonthPicker
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        setSelectedMonth={setSelectedMonth}
        setSelectedYear={setSelectedYear}
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
            {loading ? (
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
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-t-2 border-b-2 border-red-500"></div>
            ) : (
              <p className="text-2xl sm:text-3xl font-bold text-white text-center">
                {formatCurrency(totalGastos)}
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
            {loading ? (
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
            {loading ? (
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