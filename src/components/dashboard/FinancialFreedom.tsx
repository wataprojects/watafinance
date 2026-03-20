"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Flame, Zap } from "lucide-react";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const FinancialFreedom = () => {
  // Datos de ejemplo
  const currentNetWorth = 45000;
  const fireNumber = 500000;
  const annualExpenses = 62400;
  const fireExpenses = annualExpenses * 25; // Regla del 4%
  const progress = (currentNetWorth / fireNumber) * 100;
  const yearsToFire = Math.ceil((fireNumber - currentNetWorth) / 15000); // Asumiendo ahorro anual

  return (
    <Card className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Target className="w-5 h-5" />
            Progreso hacia Libertad Financiera
          </CardTitle>
          <span className="text-2xl font-bold">{progress.toFixed(1)}%</span>
        </div>
      </CardHeader>
      <CardContent>
        {/* Círculo de progreso */}
        <div className="flex justify-center my-6">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="12"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="white"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${progress * 4.4} 440`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{formatCurrency(currentNetWorth)}</span>
              <span className="text-xs text-white/70">Patrimonio actual</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-3 bg-white/10 rounded-xl">
            <Zap className="w-5 h-5 mx-auto mb-1 text-yellow-300" />
            <p className="text-xs text-white/70">Objetivo FIRE</p>
            <p className="font-bold">{formatCurrency(fireNumber)}</p>
          </div>
          <div className="text-center p-3 bg-white/10 rounded-xl">
            <Flame className="w-5 h-5 mx-auto mb-1 text-orange-300" />
            <p className="text-xs text-white/70">Gastos anuales</p>
            <p className="font-bold">{formatCurrency(annualExpenses)}</p>
          </div>
          <div className="text-center p-3 bg-white/10 rounded-xl">
            <Target className="w-5 h-5 mx-auto mb-1 text-emerald-300" />
            <p className="text-xs text-white/70">Años estimados</p>
            <p className="font-bold">~{yearsToFire} años</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialFreedom;