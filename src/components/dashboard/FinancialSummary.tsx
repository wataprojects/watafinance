"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, DollarSign, PiggyBank } from "lucide-react";

const months2026 = [
  { value: "01", label: "Enero 2026" },
  { value: "02", label: "Febrero 2026" },
  { value: "03", label: "Marzo 2026" },
  { value: "04", label: "Abril 2026" },
  { value: "05", label: "Mayo 2026" },
  { value: "06", label: "Junio 2026" },
  { value: "07", label: "Julio 2026" },
  { value: "08", label: "Agosto 2026" },
  { value: "09", label: "Septiembre 2026" },
  { value: "10", label: "Octubre 2026" },
  { value: "11", label: "Noviembre 2026" },
  { value: "12", label: "Diciembre 2026" },
];

// Datos de ejemplo para不同的 meses
const getDataForMonth = (month: string) => {
  const data: Record<string, { income: number; expenses: number; savingsRate: number }> = {
    "01": { income: 8500, expenses: 5200, savingsRate: 38.8 },
    "02": { income: 8200, expenses: 5100, savingsRate: 37.8 },
    "03": { income: 9100, expenses: 5400, savingsRate: 40.7 },
    "04": { income: 8800, expenses: 5600, savingsRate: 36.4 },
    "05": { income: 9500, expenses: 5800, savingsRate: 38.9 },
    "06": { income: 8900, expenses: 5200, savingsRate: 41.6 },
    "07": { income: 9200, expenses: 5500, savingsRate: 40.2 },
    "08": { income: 8700, expenses: 5300, savingsRate: 39.1 },
    "09": { income: 9800, expenses: 5700, savingsRate: 41.8 },
    "10": { income: 9400, expenses: 5400, savingsRate: 42.6 },
    "11": { income: 9100, expenses: 5200, savingsRate: 42.9 },
    "12": { income: 10500, expenses: 5800, savingsRate: 44.8 },
  };
  return data[month] || { income: 0, expenses: 0, savingsRate: 0 };
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const FinancialSummary = () => {
  const [selectedMonth, setSelectedMonth] = useState("06");
  const data = getDataForMonth(selectedMonth);
  const balance = data.income - data.expenses;

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Ingresos */}
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Ingresos</span>
            </div>
            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
              {formatCurrency(data.income)}
            </p>
          </div>

          {/* Total Gastos */}
          <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">Gastos</span>
            </div>
            <p className="text-xl font-bold text-rose-700 dark:text-rose-300">
              {formatCurrency(data.expenses)}
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
              {data.savingsRate}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialSummary;