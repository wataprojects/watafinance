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
  // Obtener el mes actual (0 = enero, 11 = diciembre)
  const currentMonth = new Date().getMonth() + 1;
  const currentMonthStr = currentMonth.toString().padStart(2, '0');
  
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [incomes, setIncomes] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
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

  const selectedMonthLabel = months.find(m => m.value === selectedMonth)?.label || "";

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white">
            Resumen {selectedMonthLabel} {currentYear}
          </CardTitle>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px] bg-sky-500/20 border-sky-500/40 text-white">
              <SelectValue placeholder="Seleccionar mes" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value} className="text-white">
                  {month.label} {currentYear}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-400"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Ingresos */}
            <div className="bg-sky-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-sky-300" />
                <span className="text-xs text-sky-300 font-medium">Ingresos</span>
              </div>
              <p className="text-xl font-bold text-white">
                {formatCurrency(totalIncome)}
              </p>
            </div>

            {/* Total Gastos */}
            <div className="bg-rose-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-rose-300" />
                <span className="text-xs text-rose-300 font-medium">Gastos</span>
              </div>
              <p className="text-xl font-bold text-white">
                {formatCurrency(totalExpenses)}
              </p>
            </div>

            {/* Balance */}
            <div className={`${balance >= 0 ? "bg-emerald-500/20" : "bg-orange-500/20"} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className={`w-4 h-4 ${balance >= 0 ? "text-emerald-300" : "text-orange-300"}`} />
                <span className={`text-xs ${balance >= 0 ? "text-emerald-300" : "text-orange-300"} font-medium`}>Balance</span>
              </div>
              <p className={`text-xl font-bold ${balance >= 0 ? "text-white" : "text-white"}`}>
                {formatCurrency(balance)}
              </p>
            </div>

            {/* Tasa de Ahorro */}
            <div className="bg-purple-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <PiggyBank className="w-4 h-4 text-purple-300" />
                <span className="text-xs text-purple-300 font-medium">Ahorro</span>
              </div>
              <p className="text-xl font-bold text-white">
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