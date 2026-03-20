"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import FinancialSummary from "@/components/dashboard/FinancialSummary";
import IncomeBalance from "@/components/dashboard/IncomeBalance";
import FinancialFreedom from "@/components/dashboard/FinancialFreedom";
import FinancialHealth from "@/components/dashboard/FinancialHealth";
import TopExpenses from "@/components/dashboard/TopExpenses";
import IncomeExpenseChart from "@/components/dashboard/IncomeExpenseChart";
import BottomNav from "@/components/dashboard/BottomNav";
import { LogOut, Bell, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">F</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">FinPro</h1>
                <p className="text-xs text-slate-500">Bienvenido de nuevo</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
              <Button variant="ghost" size="icon">
                <User className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Resumen financiero */}
        <FinancialSummary />

        {/* Grid de 2 columnas */}
        <div className="grid md:grid-cols-2 gap-6">
          <IncomeBalance />
          <FinancialHealth />
        </div>

        {/* Libertad financiera */}
        <FinancialFreedom />

        {/* Grid de 2 columnas */}
        <div className="grid md:grid-cols-2 gap-6">
          <TopExpenses />
          <IncomeExpenseChart />
        </div>
      </main>

      {/* Navegación inferior */}
      <BottomNav />
    </div>
  );
};

export default Dashboard;