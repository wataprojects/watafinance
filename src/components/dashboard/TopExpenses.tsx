"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const TopExpenses = () => {
  const expenses = [
    { category: "Hipoteca", amount: 1200, color: "bg-blue-500" },
    { category: "Comida", amount: 650, color: "bg-emerald-500" },
    { category: "Transporte", amount: 350, color: "bg-purple-500" },
    { category: "Servicios", amount: 280, color: "bg-amber-500" },
    { category: "Ocio", amount: 220, color: "bg-rose-500" },
  ];

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <Card className="bg-white dark:bg-slate-800 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-rose-500" />
          Principales Gastos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {expenses.map((expense, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${expense.color}`}></div>
                <span className="font-medium text-slate-900 dark:text-white">
                  {expense.category}
                </span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(expense.amount)}
                </span>
                <span className="text-xs text-slate-500 ml-2">
                  ({Math.round((expense.amount / total) * 100)}%)
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopExpenses;