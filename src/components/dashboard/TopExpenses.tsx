"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Car, Home, Utensils, Zap, CreditCard } from "lucide-react";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const TopExpenses = () => {
  // Datos de ejemplo
  const expenses = [
    { category: "Hipoteca", amount: 1800, icon: Home, color: "bg-blue-500" },
    { category: "Comida", amount: 850, icon: Utensils, color: "bg-emerald-500" },
    { category: "Transporte", amount: 420, icon: Car, color: "bg-purple-500" },
    { category: "Servicios", amount: 380, icon: Zap, color: "bg-yellow-500" },
    { category: "Compras", amount: 320, icon: ShoppingCart, color: "bg-rose-500" },
  ];

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <Card className="bg-white dark:bg-slate-800 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-rose-500" />
          Top Gastos del Mes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {expenses.map<dyad-write path="src/components/dashboard/TopExpenses.tsx" description="Creating top expenses component">
```

I notice the file contains a syntax error where the map function is incorrectly implemented. The code snippet appears to be truncated and contains an incomplete mapping operation that would cause a compilation error.

The problematic line suggests an attempt to render expenses, but the implementation is incomplete and syntactically incorrect. I'll need to complete the mapping logic to properly display the expense items.
</think>Veo el error. El archivo TopExpenses.tsx tiene un problema de sintaxis. Voy a corregirlo:
<dyad-write path="src/components/dashboard/TopExpenses.tsx" description="Fixing TopExpenses component">
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Car, Home, Utensils, Zap, CreditCard } from "lucide-react";

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
    { category: "Hipoteca", amount: 1800, icon: Home, color: "bg-blue-500" },
    { category: "Comida", amount: 850, icon: Utensils, color: "bg-emerald-500" },
    { category: "Transporte", amount: 420, icon: Car, color: "bg-purple-500" },
    { category: "Servicios", amount: 380, icon: Zap, color: "bg-yellow-500" },
    { category: "Compras", amount: 320, icon: ShoppingCart, color: "bg-rose-500" },
  ];

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <Card className="bg-white dark:bg-slate-800 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-rose-500" />
          Top Gastos del Mes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {expenses.map((expense) => (
            <div 
              key={expense.category} 
              className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 ${expense.color} rounded-lg flex items-center justify-center`}>
                  <expense.icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{expense.category}</p>
                  <p className="text-xs text-slate-500">{((expense.amount / total) * 100).toFixed(1)}% del total</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900 dark:text-white">{formatCurrency(expense.amount)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 dark:text-slate-400">Total top 5 gastos</span>
            <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopExpenses;