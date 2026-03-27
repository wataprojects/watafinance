"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/utils/currency";

const OnboardingDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [loading]);

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      setLoading(false);
      return;
    }

    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const startDate = `${year}-${month}-01`;
    const endDate = `${year}-${month}-31`;

    // Fetch incomes for current month
    const incomesResult = await supabase
      .from("incomes")
      .select("amount")
      .eq("user_id", session.user.id)
      .gte("date", startDate)
      .lte("date", endDate);

    // Fetch expenses for current month
    const expensesResult = await supabase
      .from("expenses")
      .select("amount")
      .eq("user_id", session.user.id)
      .gte("date", startDate)
      .lte("date", endDate);

    if (incomesResult.data) {
      const total = incomesResult.data.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
      setTotalIncome(total);
    }

    if (expensesResult.data) {
      const total = expensesResult.data.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
      setTotalExpenses(total);
    }

    setLoading(false);
  };

  const handleComplete = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", session.user.id);
    }

    navigate("/dashboard");
  };

  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">¡Bienvenido a FinPro!</h2>
        <p className="text-zinc-400">Tu resumen financiero de este mes</p>
      </div>

      {/* Ingresos / Gastos */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-xs text-green-400 font-medium">Ingresos</span>
            </div>
            {loading ? (
              <div className="animate-pulse h-8 bg-zinc-800 rounded"></div>
            ) : (
              <p className="text-xl font-bold text-white">
                {formatCurrency(totalIncome)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <span className="text-xs text-red-400 font-medium">Gastos</span>
            </div>
            {loading ? (
              <div className="animate-pulse h-8 bg-zinc-800 rounded"></div>
            ) : (
              <p className="text-xl font-bold text-white">
                {formatCurrency(totalExpenses)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Balance / Tasa de Ahorro */}
      <div className="grid grid-cols-2 gap-4">
        <Card className={`${balance >= 0 ? "bg-zinc-900" : "bg-red-900/20"} border ${balance >= 0 ? "border-zinc-800" : "border-red-800"}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className={`w-4 h-4 ${balance >= 0 ? "text-green-500" : "text-red-500"}`} />
              <span className={`text-xs font-medium ${balance >= 0 ? "text-green-400" : "text-red-400"}`}>Balance</span>
            </div>
            {loading ? (
              <div className="animate-pulse h-8 bg-zinc-800 rounded"></div>
            ) : (
              <p className={`text-xl font-bold ${balance >= 0 ? "text-green-500" : "text-red-500"}`}>
                {formatCurrency(balance)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <PiggyBank className="w-4 h-4 text-green-500" />
              <span className="text-xs text-green-400 font-medium">Ahorro</span>
            </div>
            {loading ? (
              <div className="animate-pulse h-8 bg-zinc-800 rounded"></div>
            ) : (
              <p className="text-xl font-bold text-white">
                {savingsRate.toFixed(1)}%
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="text-center py-4">
        <p className="text-zinc-500 text-sm">
          Añade más categorías cuando quieras. Nosotros aprendemos de tus hábitos
        </p>
      </div>

      <Button
        onClick={handleComplete}
        className="w-full bg-green-500 hover:bg-green-600 text-black py-6 font-semibold text-lg rounded-xl flex items-center justify-center gap-2"
      >
        Ir al Dashboard
        <ArrowRight className="w-5 h-5" />
      </Button>

      <div className="text-center">
        <p className="text-zinc-600 text-sm">
          Redireccionando en {countdown} segundos...
        </p>
      </div>
    </div>
  );
};

export default OnboardingDashboard;