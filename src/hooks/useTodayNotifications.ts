"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface NotificationItem {
  id: string;
  type: "expense" | "income" | "loan";
  title: string;
  description: string;
  amount: number;
  date: Date;
  dayLabel?: "today" | "tomorrow";
}

interface Totals {
  income: number;
  expense: number;
}

interface UseTodayNotificationsReturn {
  expensesToday: NotificationItem[];
  expensesTomorrow: NotificationItem[];
  incomesToday: NotificationItem[];
  incomesTomorrow: NotificationItem[];
  loading: boolean;
  totals: {
    today: Totals;
    tomorrow: Totals;
  };
}

export const useTodayNotifications = (): UseTodayNotificationsReturn => {
  const [expensesToday, setExpensesToday] = useState<NotificationItem[]>([]);
  const [expensesTomorrow, setExpensesTomorrow] = useState<NotificationItem[]>([]);
  const [incomesToday, setIncomesToday] = useState<NotificationItem[]>([]);
  const [incomesTomorrow, setIncomesTomorrow] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      
      const tomorrowDate = new Date(todayDate);
      tomorrowDate.setDate(tomorrowDate.getDate() + 1);

      const dayAfterTomorrowDate = new Date(todayDate);
      dayAfterTomorrowDate.setDate(dayAfterTomorrowDate.getDate() + 2);

      // Get date strings for comparisons
      const todayStr = todayDate.toISOString().split("T")[0];
      const tomorrowStr = tomorrowDate.toISOString().split("T")[0];
      const dayAfterTomorrowStr = dayAfterTomorrowDate.toISOString().split("T")[0];

      // Fetch expenses for today and tomorrow
      const { data: expenses } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", todayStr)
        .lt("date", dayAfterTomorrowStr);

      // Fetch incomes for today and tomorrow
      const { data: incomes } = await supabase
        .from("incomes")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", todayStr)
        .lt("date", dayAfterTomorrowStr);

      const todayExpenseNotifications: NotificationItem[] = [];
      const tomorrowExpenseNotifications: NotificationItem[] = [];
      const todayIncomeNotifications: NotificationItem[] = [];
      const tomorrowIncomeNotifications: NotificationItem[] = [];

      // Process expenses
      expenses?.forEach((expense: any) => {
        const expenseDate = new Date(expense.date);
        const item: NotificationItem = {
          id: expense.id,
          type: "expense",
          title: expense.description || expense.category,
          description: `Gasto ${expense.is_recurring ? "recurrente" : "único"}`,
          amount: Number(expense.amount),
          date: expenseDate,
        };

        const itemDateStr = expense.date;
        if (itemDateStr < tomorrowStr) {
          item.dayLabel = "today";
          todayExpenseNotifications.push(item);
        } else {
          item.dayLabel = "tomorrow";
          tomorrowExpenseNotifications.push(item);
        }
      });

      // Process incomes
      incomes?.forEach((income: any) => {
        const incomeDate = new Date(income.date);
        const item: NotificationItem = {
          id: income.id,
          type: "income",
          title: income.description || income.source || "Ingreso",
          description: `Ingreso ${income.is_recurring ? "recurrente" : "único"}`,
          amount: Number(income.amount),
          date: incomeDate,
        };

        const itemDateStr = income.date;
        if (itemDateStr < tomorrowStr) {
          item.dayLabel = "today";
          todayIncomeNotifications.push(item);
        } else {
          item.dayLabel = "tomorrow";
          tomorrowIncomeNotifications.push(item);
        }
      });

      setExpensesToday(todayExpenseNotifications);
      setExpensesTomorrow(tomorrowExpenseNotifications);
      setIncomesToday(todayIncomeNotifications);
      setIncomesTomorrow(tomorrowIncomeNotifications);
      setLoading(false);
    };

    fetchNotifications();
  }, []);

  // Calculate totals
  const totals = {
    today: {
      income: incomesToday.reduce((sum, item) => sum + item.amount, 0),
      expense: expensesToday.reduce((sum, item) => sum + item.amount, 0),
    },
    tomorrow: {
      income: incomesTomorrow.reduce((sum, item) => sum + item.amount, 0),
      expense: expensesTomorrow.reduce((sum, item) => sum + item.amount, 0),
    },
  };

  return {
    expensesToday,
    expensesTomorrow,
    incomesToday,
    incomesTomorrow,
    loading,
    totals,
  };
};
