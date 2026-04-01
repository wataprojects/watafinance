import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { createClient } from "@supabase/supabase-js";

export interface NotificationItem {
  id: string;
  type: "expense" | "income" | "debt" | "loan";
  title: string;
  description: string;
  amount: number;
  date: string;
}

interface UseTodayNotificationsResult {
  movementsToday: NotificationItem[];
  movementsTomorrow: NotificationItem[];
  loading: boolean;
  totals: {
    income: number;
    expense: number;
    debt: number;
    loan: number;
  };
}

export const useTodayNotifications = (): UseTodayNotificationsResult => {
  const [movementsToday, setMovementsToday] = useState<NotificationItem[]>([]);
  const [movementsTomorrow, setMovementsTomorrow] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({
    income: 0,
    expense: 0,
    debt: 0,
    loan: 0,
  });

  useEffect(() => {
    fetchMovements();
  }, []);

  const fetchMovements = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      setLoading(false);
      return;
    }

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get tomorrow's date
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Format dates as YYYY-MM-DD
    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Fetch today's expenses (recurring expenses scheduled for today)
    const todayExpenseResult = await supabase
      .from("expenses")
      .select("id, amount, description, category, date, is_recurring, collection_day")
      .eq("user_id", session.user.id)
      .eq("is_recurring", true)
      .lte("start_date", todayStr)
      .or(`end_date.is.null,end_date.gte.${todayStr}`);

    // Fetch today's incomes (recurring incomes scheduled for today)
    const todayIncomeResult = await supabase
      .from("incomes")
      .select("id, amount, description, category, date, is_recurring")
      .eq("user_id", session.user.id)
      .eq("is_recurring", true)
      .lte("start_date", todayStr)
      .or(`end_date.is.null,end_date.gte.${todayStr}`);

    // Fetch today's debts (debts with collection_day matching today)
    const todayDebtsResult = await supabase
      .from("debts")
      .select("id, name, current_amount, category, collection_day, status")
      .eq("user_id", session.user.id)
      .eq("status", "active")
      .eq("collection_day", today.getDate());

    // Fetch tomorrow's debts
    const tomorrowDebtsResult = await supabase
      .from("debts")
      .select("id, name, current_amount, category, collection_day, status")
      .eq("user_id", session.user.id)
      .eq("status", "active")
      .eq("collection_day", tomorrow.getDate());

    // Fetch tomorrow's expenses (recurring expenses scheduled for tomorrow)
    const tomorrowExpenseResult = await supabase
      .from("expenses")
      .select("id, amount, description, category, date, is_recurring, collection_day")
      .eq("user_id", session.user.id)
      .eq("is_recurring", true)
      .lte("start_date", tomorrowStr)
      .or(`end_date.is.null,end_date.gte.${tomorrowStr}`);

    // Fetch tomorrow's incomes (recurring incomes scheduled for tomorrow)
    const tomorrowIncomeResult = await supabase
      .from("incomes")
      .select("id, amount, description, category, date, is_recurring")
      .eq("user_id", session.user.id)
      .eq("is_recurring", true)
      .lte("start_date", tomorrowStr)
      .or(`end_date.is.null,end_date.gte.${tomorrowStr}`);

    // Process and format today's movements
    const todayMovements: NotificationItem[] = [];
    
    // Add today's expenses that are recurring
    if (todayExpenseResult.data) {
      todayExpenseResult.data.forEach((expense) => {
        todayMovements.push({
          id: expense.id,
          type: "expense",
          title: expense.description || expense.category,
          description: `${expense.category}`,
          amount: parseFloat(expense.amount),
          date: todayStr,
        });
      });
    }

    // Add today's incomes that are recurring
    if (todayIncomeResult.data) {
      todayIncomeResult.data.forEach((income) => {
        todayMovements.push({
          id: income.id,
          type: "income",
          title: income.description || income.category,
          description: `${income.category}`,
          amount: parseFloat(income.amount),
          date: todayStr,
        });
      });
    }

    // Add today's debts
    if (todayDebtsResult.data) {
      todayDebtsResult.data.forEach((debt) => {
        todayMovements.push({
          id: debt.id,
          type: "debt",
          title: debt.name,
          description: `${debt.category || "Deuda"}`,
          amount: parseFloat(debt.current_amount),
          date: todayStr,
        });
      });
    }

    // Process and format tomorrow's movements
    const tomorrowMovements: NotificationItem[] = [];

    // Add tomorrow's expenses that are recurring
    if (tomorrowExpenseResult.data) {
      tomorrowExpenseResult.data.forEach((expense) => {
        tomorrowMovements.push({
          id: `tomorrow-${expense.id}`,
          type: "expense",
          title: expense.description || expense.category,
          description: `${expense.category}`,
          amount: parseFloat(expense.amount),
          date: tomorrowStr,
        });
      });
    }

    // Add tomorrow's incomes that are recurring
    if (tomorrowIncomeResult.data) {
      tomorrowIncomeResult.data.forEach((income) => {
        tomorrowMovements.push({
          id: `tomorrow-${income.id}`,
          type: "income",
          title: income.description || income.category,
          description: `${income.category}`,
          amount: parseFloat(income.amount),
          date: tomorrowStr,
        });
      });
    }

    // Add tomorrow's debts
    if (tomorrowDebtsResult.data) {
      tomorrowDebtsResult.data.forEach((debt) => {
        tomorrowMovements.push({
          id: `tomorrow-${debt.id}`,
          type: "debt",
          title: debt.name,
          description: `${debt.category || "Deuda"}`,
          amount: parseFloat(debt.current_amount),
          date: tomorrowStr,
        });
      });
    }

    setMovementsToday(todayMovements);
    setMovementsTomorrow(tomorrowMovements);

    // Calculate totals
    const totalIncome = todayMovements.filter((m) => m.type === "income").reduce((sum, m) => sum + m.amount, 0);
    const totalExpense = todayMovements.filter((m) => m.type === "expense").reduce((sum, m) => sum + m.amount, 0);
    const totalDebt = todayMovements.filter((m) => m.type === "debt").reduce((sum, m) => sum + m.amount, 0);
    const totalLoan = todayMovements.filter((m) => m.type === "loan").reduce((sum, m) => sum + m.amount, 0);

    setTotals({
      income: totalIncome,
      expense: totalExpense,
      debt: totalDebt,
      loan: totalLoan,
    });

    setLoading(false);
  };

  return {
    movementsToday,
    movementsTomorrow,
    loading,
    totals,
  };
};