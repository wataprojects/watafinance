"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Home, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const IncomeBalance = () => {
  const [incomes, setIncomes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncomes();
  }, []);

  const fetchIncomes = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("incomes")
      .select("amount, is_passive")
      .eq("user_id", session.user.id);

    if (data) setIncomes(data);
    setLoading(false);
  };

  const activeIncome = incomes.filter(i => !i.is_passive).reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
  const passiveIncome = incomes.filter(i => i.is_passive).reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
  const totalIncome = activeIncome + passiveIncome;
  const passivePercentage = totalIncome > 0 ? Math.round((passiveIncome / totalIncome) * 100) : 0;

  return (
    <Card className="bg-white dark:bg-slate-800 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Balance de Ingresos</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Ingresos Activos */}
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Ingresos Activos</p>
                  <p className="text-xs text-slate-500">Trabajo / Negocio</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-700 dark:text-blue-300">{formatCurrency(activeIncome)}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">{100 - passivePercentage}%</p>
              </div>
            </div>

            {/* Ingresos Pasivos */}
            <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Ingresos Pasivos</p>
                  <p className="text-xs text-slate-500">Rentas / Inversiones</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-emerald-700 dark:text-emerald-300">{formatCurrency(passiveIncome)}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">{passivePercentage}%</p>
              </div>
            </div>

            {/* Total y meta */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium">Meta FIRE: 70% pasivo</span>
                </div>
                <span className="text-sm font-bold text-purple-600">{passivePercentage}%</span>
              </div>
              <div className="mt-2 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-purple-500 rounded-full transition-all"
                  style={{ width: `${Math.min((passivePercentage / 70) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IncomeBalance;