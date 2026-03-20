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
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-white">Balance de Ingresos</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-400"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Ingresos Activos */}
            <div className="flex items-center justify-between p-4 bg-sky-500/20 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-white">Ingresos Activos</p>
                  <p className="text-xs text-sky-200">Trabajo / Negocio</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-white">{formatCurrency(activeIncome)}</p>
                <p className="text-xs text-sky-300">{100 - passivePercentage}%</p>
              </div>
            </div>

            {/* Ingresos Pasivos */}
            <div className="flex items-center justify-between p-4 bg-emerald-500/20 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-white">Ingresos Pasivos</p>
                  <p className="text-xs text-emerald-200">Rentas / Inversiones</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-white">{formatCurrency(passiveIncome)}</p>
                <p className="text-xs text-emerald-300">{passivePercentage}%</p>
              </div>
            </div>

            {/* Total y meta */}
            <div className="pt-4 border-t border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-sky-300" />
                  <span className="text-sm font-medium text-white">Meta FIRE: 70% pasivo</span>
                </div>
                <span className="text-sm font-bold text-sky-300">{passivePercentage}%</span>
              </div>
              <div className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-sky-400 to-purple-400 rounded-full transition-all"
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