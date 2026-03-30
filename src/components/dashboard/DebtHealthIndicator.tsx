"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/utils/currency";
import { Card, CardContent } from "@/components/ui/card";
import { Landmark, TrendingDown, TrendingUp, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface DebtHealthIndicatorProps {
  totalDebt: number;
  totalMonthly: number;
  userId: string;
}

type HealthStatus = "healthy" | "moderate" | "risk" | "unknown";

interface HealthState {
  status: HealthStatus;
  percentage: number;
  message: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  warningMessage: string | null;
}

const DebtHealthIndicator: React.FC<DebtHealthIndicatorProps> = ({
  totalDebt,
  totalMonthly,
  userId
}) => {
  const [incomeAverage, setIncomeAverage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchIncomeAverage();
    }
  }, [userId]);

  const fetchIncomeAverage = async () => {
    setLoading(true);
    
    // Get the last 3 months of income
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    
    const { data, error } = await supabase
      .from("incomes")
      .select("amount, date")
      .eq("user_id", userId)
      .gte("date", threeMonthsAgo.toISOString().split("T")[0]);

    if (error || !data || data.length === 0) {
      setIncomeAverage(null);
      setLoading(false);
      return;
    }

    // Calculate average monthly income
    const totalIncome = data.reduce((sum, item) => sum + parseFloat(item.amount), 0);
    const monthsWithIncome = new Set(data.map(item => {
      const d = new Date(item.date);
      return `${d.getFullYear()}-${d.getMonth()}`;
    })).size;
    
    const average = monthsWithIncome > 0 ? totalIncome / monthsWithIncome : 0;
    setIncomeAverage(average);
    setLoading(false);
  };

  const getHealthState = (): HealthState => {
    if (loading || incomeAverage === null || incomeAverage === 0) {
      return {
        status: "unknown",
        percentage: 0,
        message: "No podemos calcular tu carga financiera sin ingresos",
        color: "text-zinc-400",
        bgColor: "bg-zinc-800",
        icon: <AlertTriangle className="w-5 h-5" />,
        warningMessage: null
      };
    }

    const percentage = (totalMonthly / incomeAverage) * 100;

    // Nuevo rango: 0-20% saludable
    if (percentage < 20) {
      // Sub-rango crítico: 18-20%
      if (percentage >= 18) {
        return {
          status: "healthy",
          percentage,
          message: "Tu carga financiera es saludable, pero estás cerca del límite recomendado.",
          color: "text-emerald-400",
          bgColor: "bg-emerald-500/20",
          icon: <CheckCircle className="w-5 h-5" />,
          warningMessage: percentage > 15 ? "Si tus cuotas superan el 25%, podrías empezar a tener presión financiera." : null
        };
      }
      // Normal saludable: <18%
      return {
        status: "healthy",
        percentage,
        message: "Tu carga financiera es saludable. Buen control de deuda.",
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/20",
        icon: <CheckCircle className="w-5 h-5" />,
        warningMessage: null
      };
    }
    
    // Nuevo rango: 20-35% moderado
    if (percentage <= 35) {
      return {
        status: "moderate",
        percentage,
        message: "Tu carga financiera empieza a ser elevada. Conviene vigilarla.",
        color: "text-amber-400",
        bgColor: "bg-amber-500/20",
        icon: <AlertTriangle className="w-5 h-5" />,
        warningMessage: "Si tus cuotas superan el 25%, podrías empezar a tener presión financiera."
      };
    }
    
    // >35% riesgo
    return {
      status: "risk",
      percentage,
      message: "Tu carga financiera es alta. Existe riesgo financiero.",
      color: "text-red-400",
      bgColor: "bg-red-500/20",
      icon: <XCircle className="w-5 h-5" />,
      warningMessage: "Si tus cuotas superan el 25%, podrías empezar a tener presión financiera."
    };
  };

  const healthState = getHealthState();

  const getStatusEmoji = () => {
    switch (healthState.status) {
      case "healthy": return "🟢";
      case "moderate": return "🟡";
      case "risk": return "🔴";
      default: return "⚪";
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-r from-cyan-600 to-cyan-700 border-0">
          <CardContent className="p-4 sm:p-6 text-center">
            <Landmark className="w-8 h-8 mx-auto mb-2 text-white/80" />
            <p className="text-2xl sm:text-3xl font-bold text-white truncate" title={formatCurrency(totalDebt)}>
              {formatCurrency(totalDebt)}
            </p>
            <p className="text-white/80 text-sm">Deuda total</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-500 to-rose-500 border-0">
          <CardContent className="p-4 sm:p-6 text-center">
            <TrendingDown className="w-8 h-8 mx-auto mb-2 text-white/80" />
            <p className="text-2xl sm:text-3xl font-bold text-white truncate" title={formatCurrency(totalMonthly)}>
              {formatCurrency(totalMonthly)}
            </p>
            <p className="text-white/80 text-sm">Cuotas/mes</p>
          </CardContent>
        </Card>
      </div>

      {/* Health Status Indicator */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${healthState.bgColor}`}>
              <span className="text-2xl">{getStatusEmoji()}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`font-medium ${healthState.color}`}>
                  {healthState.status === "healthy" && "Saludable"}
                  {healthState.status === "moderate" && "Moderado"}
                  {healthState.status === "risk" && "En riesgo"}
                  {healthState.status === "unknown" && "Sin datos"}
                </span>
                {incomeAverage !== null && incomeAverage > 0 && (
                  <span className="text-zinc-500 text-sm">
                    ({healthState.percentage.toFixed(1)}% de tus ingresos)
                  </span>
                )}
              </div>
              <p className="text-zinc-400 text-sm mt-1">{healthState.message}</p>
              {healthState.warningMessage && (
                <p className="text-zinc-500 text-xs mt-2 italic">
                  {healthState.warningMessage}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DebtHealthIndicator;