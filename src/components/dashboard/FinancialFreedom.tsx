"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Flame, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const FinancialFreedom = () => {
  const [loading, setLoading] = useState(true);
  const [patrimony, setPatrimony] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [debts, setDebts] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      setLoading(false);
      return;
    }

    const [patrimonyResult, investmentsResult, debtsResult] = await Promise.all([
      supabase.from("patrimony").select("value").eq("user_id", session.user.id),
      supabase.from("investments").select("current_value").eq("user_id", session.user.id),
      supabase.from("debts").select("current_amount").eq("user_id", session.user.id)
    ]);

    if (patrimonyResult.data) setPatrimony(patrimonyResult.data);
    if (investmentsResult.data) setInvestments(investmentsResult.data);
    if (debtsResult.data) setDebts(debtsResult.data);
    setLoading(false);
  };

  const totalPatrimony = patrimony.reduce((sum, p) => sum + parseFloat(p.value || 0), 0);
  const totalInvestments = investments.reduce((sum, i) => sum + parseFloat(i.current_value || 0), 0);
  const totalDebts = debts.reduce((sum, d) => sum + parseFloat(d.current_amount || 0), 0);
  
  const currentNetWorth = totalPatrimony + totalInvestments - totalDebts;
  const fireNumber = 500000;
  const annualExpenses = 30000;
  const progress = fireNumber > 0 ? (currentNetWorth / fireNumber) * 100 : 0;
  const yearsToFire = Math.ceil((fireNumber - currentNetWorth) / 15000);

  return (
    <Card className="bg-gradient-to-r from-sky-600 to-sky-800 text-white shadow-lg">
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
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : (
          <>
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
                    strokeDasharray={`${Math.min(progress, 100) * 4.4} 440`}
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
                <p className="font-bold">~{yearsToFire > 0 ? yearsToFire : 0} años</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default FinancialFreedom;