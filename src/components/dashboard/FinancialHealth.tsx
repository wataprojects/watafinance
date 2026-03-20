"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Shield, AlertTriangle, CheckCircle } from "lucide-react";

const FinancialHealth = () => {
  // Datos de ejemplo
  const score = 78;
  const categories = [
    { name: "Ahorro", score: 85, status: "excellent" },
    { name: "Deuda", score: 72, status: "good" },
    { name: "Inversiones", score: 65, status: "good" },
    { name: "Flujo de caja", score: 90, status: "excellent" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "text-emerald-500";
      case "good": return "text-blue-500";
      case "warning": return "text-yellow-500";
      case "poor": return "text-red-500";
      default: return "text-slate-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "excellent": return <CheckCircle className="w-4 h-4" />;
      case "good": return <Shield className="w-4 h-4" />;
      case "warning": return <AlertTriangle className="w-4 h-4" />;
      default: return <Heart className="w-4 h-4" />;
    }
  };

  return (
    <Card className="bg-white dark:bg-slate-800 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            Salud Financiera
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-rose-500">{score}</span>
            <span className="text-sm text-slate-500">/ 100</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={getStatusColor(category.status)}>
                    {getStatusIcon(category.status)}
                  </span>
                  <span className="font-medium text-slate-900 dark:text-white">{category.name}</span>
                </div>
                <span className={`font-bold ${getStatusColor(category.status)}`}>
                  {category.score}
                </span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    category.status === "excellent" ? "bg-emerald-500" :
                    category.status === "good" ? "bg-blue-500" :
                    category.status === "warning" ? "bg-yellow-500" : "bg-red-500"
                  }`}
                  style={{ width: `${category.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Recomendación */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>💡 Recomendación:</strong> Aumenta tus inversiones mensuales 
            un 5% para mejorar tu puntuación de inversiones.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialHealth;