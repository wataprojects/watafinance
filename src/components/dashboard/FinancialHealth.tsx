"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const FinancialHealth = () => {
  const [loading, setLoading] = useState(true);
  const [incomes, setIncomes] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
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

    const [incomesResult, expensesResult, investmentsResult, debtsResult] = await Promise.all([
      supabase.from("incomes").select("amount, is_passive").eq("user_id", session.user.id),
      supabase.from("expenses").select("amount").eq("user_id", session.user.id),
      supabase.from("investments").select("current_value").eq("user_id", session.user.id),
      supabase.from("debts").select("current_amount, initial_amount").eq("user_id", session.user.id)
    ]);

    if (incomesResult.data) setIncomes(incomesResult.data);
    if (expensesResult.data) setExpenses(expensesResult.data);
    if (investmentsResult.data) setInvestments(investmentsResult.data);
    if (debtsResult.data) setDebts(debtsResult.data);
    setLoading(false);
  };

  const totalIncome = incomes.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const totalInvestments = investments.reduce((sum, i) => sum + parseFloat(i.current_value || 0), 0);
  const totalDebts = debts.reduce((sum, d) => sum + parseFloat(d.current_amount || 0), 0);
  const totalInitialDebts = debts.reduce((sum, d) => sum + parseFloat(d.initial_amount || 0), 0);

  const savingsScore = totalIncome > 0 ? Math.min(100, ((totalIncome - totalExpenses) / totalIncome) * 100 + 50) : 50;
  const debtScore = totalInitialDebts > 0 ? Math.max(0, 100 - ((totalDebts / totalInitialDebts) * 100)) : 100;
  const investmentScore = totalIncome > 0 ? Math.min(100, (totalInvestments / totalIncome) * 10) : 0;
  const cashFlowScore = totalIncome > totalExpenses ? 90 : 50;

  const score = Math.round((savingsScore + debtScore + investmentScore + cashFlowScore) / 4);

  const categories = [
    { name: "Ahorro", score: Math.round(savingsScore), status: savingsScore >= 80 ? "excellent" : savingsScore >= 60 ? "good" : "warning" },
    { name: "Deuda", score: Math.round(debtScore), status: debtScore >= 80 ? "excellent" : debtScore >= 60 ? "good" : "warning" },
    { name: "Inversiones", score: Math.round(investmentScore), status: investmentScore >= 60 ? "excellent" : investmentScore >= 40 ? "good" : "warning" },
    { name: "Flujo de caja", score: Math.round(cashFlowScore), status: cashFlowScore >= 80 ? "excellent" : "good" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "text-green-500";
      case "good": return "text-green-400";
      case "warning": return "text-yellow-500";
      case "poor": return "text-red-500";
      default: return "text-zinc-400";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "excellent": return "bg-green-500";
      case "good": return "bg-green-600";
      case "warning": return "bg-yellow-500";
      case "poor": return "bg-red-500";
      default: return "bg-zinc-500";
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
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-white">
            <Heart className="w-5 h-5 text-green-500" />
            Salud Financiera
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-green-500">{score}</span>
            <span className="text-sm text-zinc-400">/ 100</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={getStatusColor(category.status)}>
                      {getStatusIcon(category.status)}
                    </span>
                    <span className="font-medium text-zinc-300">{category.name}</span>
                  </div>
                  <span className={`font-bold ${getStatusColor(category.status)}`}>
                    {category.score}
                  </span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${getStatusBg(category.status)}`}
                    style={{ width: `${category.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FinancialHealth;