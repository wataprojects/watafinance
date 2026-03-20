"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, DollarSign, PiggyBank } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const months2026 = [
  { value: "01", label: "Enero 2026" },
  { value: "02", label: "Febrero 2026" },
  { value: "03", label: "Marzo 2026" },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const FinancialSummary = () => {
  const [selectedMonth, setSelectedMonth] = useState("03");
  const [incomes, setIncomes] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

    const year = 2026;
    const startDate = `${year}-${selectedMonth}-01`;
    const endDate = `${year}-${selectedMonth}-31`;

    const [incomesResult, expensesResult] = await Promise.all([
      supabase
        .from("incomes")
        .select("amount, date")
        .eq("user_id", session.user.id)
        .gte("date", startDate)
        .lte("date", endDate),
      supabase
        .from("expenses")
        .select("amount, date")
        .eq("user_id", session.user.id)
        .gte("date", startDate)
        .lte("date", endDate)
    ]);

    if (incomesResult.data) setIncomes(incomesResult.data);
    if (expensesResult.data) setExpenses(expensesResult.data);
    setLoading(false);
  };

  const totalIncome = incomes.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100) : 0;

  return (
    <Card className="bg-white dark:bg-slate-800 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Resumen Financiero</CardTitle>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px] bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months2026.map((month) => (
                <SelectItem key={month.value} value={month.value}>
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
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Ingresos */}
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Ingresos</span>
              </div>
              <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                {formatCurrency(totalIncome)}
              </p>
            </div>

            {/* Total Gastos */}
            <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">Gastos</span>
              </div>
              <p className="text-xl font-bold text-rose-700 dark:text-rose-300">
                {formatCurrency(totalExpenses)}
              </p>
            </div>

            {/* Balance */}
            <div className={`${balance >= 0 ? "bg-blue-50 dark:bg-blue-900/20" : "bg-orange-50 dark:bg-orange-900/20"} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className={`w-4 h-4 ${balance >= 0 ? "text-blue-600 dark:text-blue-400" : "text-orange-600 dark:text-orange-400"}`} />
                <span className={`text-xs ${balance >= 0 ? "text-blue-600 dark:text-blue-400" : "text-orange-600 dark:text-orange-400"} font-medium`}>Balance</span>
              </div>
              <p className={`text-xl font-bold ${balance >= 0 ? "text-blue-700 dark:text-blue-300" : "text-orange-700 dark:text-orange-300"}`}>
                {formatCurrency(balance)}
              </p>
            </div>

            {/* Tasa de Ahorro */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <PiggyBank className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Ahorro</span>
              </div>
              <p className="text-xl font-bold text-purple-700 dark:text-purple-300">
                {savingsRate.toFixed(1)}%
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FinancialSummary;