"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Home, TrendingUp, PieChart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/utils/currency";
import { expandRecurringToMonths } from "@/lib/recurring";

interface IncomeBalanceProps {
  selectedMonth: string;
  selectedYear: string;
}

const IncomeBalance: React.FC<IncomeBalanceProps> = ({ selectedMonth, selectedYear }) => {
  const [incomes, setIncomes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncomes();
  }, [selectedMonth, selectedYear]);

  const fetchIncomes = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      setLoading(false);
      return;
    }

    // Fetch all incomes (we'll filter client-side for recurring logic)
    const { data } = await supabase
      .from("incomes")
      .select("amount, is_passive, date, is_recurring, start_date, end_date")
      .eq("user_id", session.user.id);

    if (data) setIncomes(data);
    setLoading(false);
  };

  // Expand recurring incomes for the selected month
  const viewMonth = parseInt(selectedMonth) - 1;
  const viewYear = parseInt(selectedYear);
  const activeIncomes = expandRecurringToMonths(incomes, viewYear, viewMonth);

  const activeIncome = activeIncomes.filter((i: any) => !i.is_passive).reduce((sum, i: any) => sum + parseFloat(i.amount || 0), 0);
  const passiveIncome = activeIncomes.filter((i: any) => i.is_passive).reduce((sum, i: any) => sum + parseFloat(i.amount || 0), 0);
  const totalIncome = activeIncome + passiveIncome;
  const passivePercentage = totalIncome > 0 ? Math.round((passiveIncome / totalIncome) * 100) : 0;
  const activePercentage = totalIncome > 0 ? Math.round((activeIncome / totalIncome) * 100) : 0;

  // Get month name
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
  const monthLabel = months.find(m => m.value === selectedMonth)?.label || "";

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-4 pt-6">
        <div className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-green-500" />
          <CardTitle className="text-lg md:text-xl font-bold text-white">
            Balance Ingresos
          </CardTitle>
        </div>
        <p className="text-xs md:text-sm text-green-400 font-medium mt-1">
          Pasivos vs Activos - {monthLabel}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Ingresos Activos con barra de progreso integrada */}
            <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Ingresos Activos</p>
                    <p className="text-xs text-zinc-400">Trabajo / Negocio</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">{formatCurrency(activeIncome)}</p>
                  <p className="text-xs text-zinc-400">{activePercentage}% del total</p>
                </div>
              </div>
              {/* Barra de progreso integrada dentro del bloque */}
              <div className="space-y-1">
                <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${activePercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Ingresos Pasivos con barra de progreso integrada */}
            <div className="p-4 bg-green-900/20 rounded-xl border border-green-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Home className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Ingresos Pasivos</p>
                    <p className="text-xs text-green-400/70">Rentas / Inversiones</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-400">{formatCurrency(passiveIncome)}</p>
                  <p className="text-xs text-green-400/70">{passivePercentage}% del total</p>
                </div>
              </div>
              {/* Barra de progreso integrada dentro del bloque */}
              <div className="space-y-1">
                <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${passivePercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* FIRE indicator */}
            <div className="pt-4 border-t border-zinc-700">
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-zinc-300">Objetivo: 70% de Ingresos Pasivos</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IncomeBalance;