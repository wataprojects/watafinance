"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, DollarSign, PiggyBank } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const FinancialSummary = () => {
  const currentMonth = new Date().getMonth() + 1;
  const currentMonthStr = currentMonth.toString().padStart(2, '0');
  
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [incomes, setIncomes] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [debts, setDebts] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const currentYear = new Date().getFullYear();
  
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

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  const fetchData = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      setLoading(false);
      return;
    }

    const year = currentYear;
    const startDate = `${year}-${selectedMonth}-01`;
    const endDate = `${year}-${selectedMonth}-31`;

    // Fetch incomes for the selected month
    const incomesResult = await supabase
      .from("incomes")
      .select("amount, date")
      .eq("user_id", session.user.id)
      .gte("date", startDate)
      .lte("date", endDate);

    // Fetch expenses for the selected month
    const expensesResult = await supabase
      .from("expenses")
      .select("amount, date")
      .eq("user_id", session.user.id)
      .gte("date", startDate)
      .lte("date", endDate);

    // Fetch debts (only "i_owe" type for the selected month)
    const debtsResult = await supabase
      .from("debts")
      .select("current_amount, created_at, category")
      .eq("user_id", session.user.id)
      .eq("category", "i_owe");

    // Fetch active loans with their monthly payment
    const loansResult = await supabase
      .from("loans")
      .select("monthly_payment, status")
      .eq("user_id", session.user.id)
      .eq("status", "active");

    if (incomesResult.data) setIncomes(incomesResult.data);
    if (expensesResult.data) setExpenses(expensesResult.data);
    if (debtsResult.data) setDebts(debtsResult.data);
    if (loansResult.data) setLoans(loansResult.data);
    setLoading(false);
  };

  const totalIncome = incomes.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
  
  // Total expenses for the month
  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  
  // Total debts (i_owe) - sum all active debts user owes
  const totalDebts = debts.reduce((sum, d) => sum + parseFloat(d.current_amount || 0), 0);
  
  // Total loans monthly payments
  const totalLoans = loans.reduce((sum, l) => sum + parseFloat(l.monthly_payment || 0), 0);
  
  // Total gastos = expenses + debts + loans
  const totalGastos = totalExpenses + totalDebts + totalLoans;
  
  const balance = totalIncome - totalGastos;
  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100) : 0;

  const selectedMonthLabel = months.find(m => m.value === selectedMonth)?.label || "";

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white">
            Resumen {selectedMonthLabel} {currentYear}
          </CardTitle>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[140px] bg-zinc-800 border-zinc-700 text-white text-sm">
              <SelectValue placeholder="Mes" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value} className="text-white">
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Ingresos row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-400 font-medium">Ingresos</span>
                </div>
                <p className="text-xl font-bold text-white">
                  {formatCurrency(totalIncome)}
                </p>
              </div>

              <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-red-500" />
                  <span className="text-xs text-red-400 font-medium">Gastos</span>
                </div>
                <p className="text-xl font-bold text-white">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>

              <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-amber-500" />
                  <span className="text-xs text-amber-400 font-medium">Deudas</span>
                </div>
                <p className="text-xl font-bold text-white">
                  {formatCurrency(totalDebts)}
                </p>
              </div>

              <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-cyan-500" />
                  <span className="text-xs text-cyan-400 font-medium">Préstamos</span>
                </div>
                <p className="text-xl font-bold text-white">
                  {formatCurrency(totalLoans)}
                </p>
              </div>
            </div>

            {/* Total Gastos (expenses + debts + loans) */}
            <div className={`${totalGastos > totalIncome ? "bg-red-900/20" : "bg-zinc-800/50"} rounded-xl p-4 border ${totalGastos > totalIncome ? "border-red-800" : "border-zinc-700"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className={`w-5 h-5 ${totalGastos > totalIncome ? "text-red-500" : "text-red-500"}`} />
                  <span className={`text-sm font-medium ${totalGastos > totalIncome ? "text-red-400" : "text-red-400"}`}>Total Gastos (Gastos + Deudas + Préstamos)</span>
                </div>
                <p className={`text-2xl font-bold ${totalGastos > totalIncome ? "text-red-500" : "text-red-500"}`}>
                  {formatCurrency(totalGastos)}
                </p>
              </div>
            </div>

            {/* Balance and Savings row */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`${balance >= 0 ? "bg-zinc-800/50" : "bg-red-900/20"} rounded-xl p-4 border ${balance >= 0 ? "border-zinc-700" : "border-red-800"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className={`w-4 h-4 ${balance >= 0 ? "text-green-500" : "text-red-500"}`} />
                  <span className={`text-xs font-medium ${balance >= 0 ? "text-green-400" : "text-red-400"}`}>Balance</span>
                </div>
                <p className={`text-xl font-bold ${balance >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {balance >= 0 ? "+" : ""}{formatCurrency(balance)}
                </p>
              </div>

              <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
                <div className="flex items-center gap-2 mb-2">
                  <PiggyBank className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-400 font-medium">Ahorro</span>
                </div>
                <p className="text-xl font-bold text-white">
                  {savingsRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FinancialSummary;