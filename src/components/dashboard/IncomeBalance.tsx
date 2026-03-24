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
  const activePercentage = totalIncome > 0 ? Math.round((activeIncome / totalIncome) * 100) : 0;

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-white">Balance Ingresos Pasivos/Activos</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
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

            {/* Progress bar for Active Income */}
            <div className="space-y-2">
              <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${activePercentage}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-900/20 rounded-xl border border-green-800">
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

            {/* Progress bar for Passive Income */}
            <div className="space-y-2">
              <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${passivePercentage}%` }}
                />
              </div>
            </div>

            {/* FIRE indicator without progress bar */}
            <div className="pt-4 border-t border-zinc-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-zinc-300">Meta FIRE: 70% pasivo</span>
                </div>
                <span className="text-sm font-bold text-green-500">{passivePercentage}%</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IncomeBalance;