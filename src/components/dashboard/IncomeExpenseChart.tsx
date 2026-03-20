"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const months = [
  { value: "01", label: "Ene" },
  { value: "02", label: "Feb" },
  { value: "03", label: "Mar" },
];

const IncomeExpenseChart = () => {
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<{ income: number; expenses: number }[]>([]);

  useEffect(() => {
    fetchMonthlyData();
  }, []);

  const fetchMonthlyData = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      setLoading(false);
      return;
    }

    const year = 2026;
    const dataPromises = months.map(async (month) => {
      const startDate = `${year}-${month.value}-01`;
      const endDate = `${year}-${month.value}-31`;

      const [incomesResult, expensesResult] = await Promise.all([
        supabase
          .from("incomes")
          .select("amount")
          .eq("user_id", session.user.id)
          .gte("date", startDate)
          .lte("date", endDate),
        supabase
          .from("expenses")
          .select("amount")
          .eq("user_id", session.user.id)
          .gte("date", startDate)
          .lte("date", endDate)
      ]);

      const income = incomesResult.data?.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0) || 0;
      const expenses = expensesResult.data?.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0) || 0;

      return { income, expenses };
    });

    const data = await Promise.all(dataPromises);
    setMonthlyData(data);
    setLoading(false);
  };

  const incomeData = monthlyData.map(d => d.income);
  const expenseData = monthlyData.map(d => d.expenses);
  const maxValue = Math.max(...incomeData, ...expenseData, 1000);

  return (
    <Card className="bg-white dark:bg-slate-800 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-500" />
          Ingresos vs Gastos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            <div className="flex items-end justify-between h-64 gap-2">
              {months.map((month, index) => (
                <div key={month.value} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex gap-1 h-48">
                    {/* Ingresos */}
                    <div 
                      className="flex-1 bg-emerald-500 rounded-t-lg transition-all hover:bg-emerald-600 relative group"
                      style={{ height: `${maxValue > 0 ? (incomeData[index] / maxValue) * 100 : 0}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {incomeData[index]}€
                      </div>
                    </div>
                    {/* Gastos */}
                    <div 
                      className="flex-1 bg-rose-400 rounded-t-lg transition-all hover:bg-rose-500 relative group"
                      style={{ height: `${maxValue > 0 ? (expenseData[index] / maxValue) * 100 : 0}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {expenseData[index]}€
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">{month.label}</span>
                </div>
              ))}
            </div>

            {/* Leyenda */}
            <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Ingresos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-rose-400 rounded-full"></div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Gastos</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default IncomeExpenseChart;