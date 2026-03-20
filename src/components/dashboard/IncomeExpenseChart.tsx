"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

const IncomeExpenseChart = () => {
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"];
  const incomeData = [8500, 8200, 9100, 8800, 9500, 8900];
  const expenseData = [5200, 5100, 5400, 5600, 5800, 5200];

  const maxValue = Math.max(...incomeData, ...expenseData);

  return (
    <Card className="bg-white dark:bg-slate-800 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-500" />
          Ingresos vs Gastos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between h-64 gap-2">
          {months.map((month, index) => (
            <div key={month} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex gap-1 h-48">
                {/* Ingresos */}
                <div 
                  className="flex-1 bg-emerald-500 rounded-t-lg transition-all hover:bg-emerald-600 relative group"
                  style={{ height: `${(incomeData[index] / maxValue) * 100}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {incomeData[index]}€
                  </div>
                </div>
                {/* Gastos */}
                <div 
                  className="flex-1 bg-rose-400 rounded-t-lg transition-all hover:bg-rose-500 relative group"
                  style={{ height: `${(expenseData[index] / maxValue) * 100}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {expenseData[index]}€
                  </div>
                </div>
              </div>
              <span className="text-xs text-slate-500">{month}</span>
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
      </CardContent>
    </Card>
  );
};

export default IncomeExpenseChart;