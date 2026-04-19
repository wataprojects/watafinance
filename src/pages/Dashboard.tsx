"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FinancialSummary from "@/components/dashboard/FinancialSummary";
import FinancialFreedom from "@/components/dashboard/FinancialFreedom";
import FinancialHealth from "@/components/dashboard/FinancialHealth";
import FinancialProjections from "@/components/dashboard/FinancialProjections";
import TopExpenses from "@/components/dashboard/TopExpenses";
import IncomeExpenseChart from "@/components/dashboard/IncomeExpenseChart";
import BottomNav from "@/components/dashboard/BottomNav";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { supabase } from "@/integrations/supabase/client";
import { runAllAutomations } from "@/utils/automation";
import { toast } from "sonner";
import { startOfMonth, subMonths } from "date-fns";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [automationRunning, setAutomationRunning] = useState(false);
  const [incomes, setIncomes] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  
  // Month/year selector state
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const currentYear = new Date().getFullYear().toString();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
    } else {
      // Run automations when user is authenticated
      await runAutomations();
      await fetchData(session.user.id);
    }
    setLoading(false);
  };

  const fetchData = async (userId: string) => {
    // We fetch data from the last 2 months to ensure we have enough context for projections
    const twoMonthsAgo = startOfMonth(subMonths(new Date(), 2)).toISOString().split('T')[0];

    const [incomesRes, expensesRes, loansRes] = await Promise.all([
      supabase.from("incomes").select("*").eq("user_id", userId).gte('date', twoMonthsAgo),
      supabase.from("expenses").select("*").eq("user_id", userId).gte('date', twoMonthsAgo),
      supabase.from("loans").select("*").eq("user_id", userId).eq("status", "active")
    ]);

    if (incomesRes.data) setIncomes(incomesRes.data);
    if (expensesRes.data) setExpenses(expensesRes.data);
    if (loansRes.data) setLoans(loansRes.data);
  };

  const runAutomations = async () => {
    setAutomationRunning(true);
    console.log('[Dashboard] Running automations...');
    
    const result = await runAllAutomations();
    
    if (result.success) {
      // Show success feedback if something was processed
      if (result.recurringTransactions) {
        const { expensesCreated, incomesCreated } = result.recurringTransactions;
        if (expensesCreated > 0 || incomesCreated > 0) {
          console.log('[Dashboard] Recurring transactions processed:', result.recurringTransactions);
        }
      }
      
      if (result.loans) {
        const { loansProcessed, loansCompleted } = result.loans;
        if (loansProcessed > 0) {
          console.log('[Dashboard] Loans processed:', result.loans);
          if (loansCompleted > 0) {
            toast.success(`¡${loansCompleted} préstamo(s) completado(s)!`);
          }
        }
      }
    } else {
      console.error('[Dashboard] Automation errors:', result.errors);
    }
    
    setAutomationRunning(false);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-28">
      {/* Header con notificaciones - usando el componente DashboardHeader */}
      <DashboardHeader title="Monyro" subtitle="Tu gestión financiera" />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Automation running indicator */}
        {automationRunning && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex items-center gap-3">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-500"></div>
            <span className="text-zinc-400 text-sm">Procesando transacciones recurrentes...</span>
          </div>
        )}
        
        <FinancialSummary
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          setSelectedMonth={setSelectedMonth}
          setSelectedYear={setSelectedYear}
          navigate={handleNavigate}
        />
        
        {/* FinancialFreedom antes de FinancialHealth */}
        <FinancialFreedom selectedMonth={selectedMonth} selectedYear={selectedYear} />
        
        {/* financialHealth después de FinancialFreedom */}
        <FinancialHealth />

        {/* Financial Projections */}
        <FinancialProjections
          incomes={incomes}
          expenses={expenses}
          loans={loans}
        />
        
        {/* Gráficos de Gastos e Ingresos/Gastos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TopExpenses />
          <IncomeExpenseChart />
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Dashboard;