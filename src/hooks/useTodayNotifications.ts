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
}

interface UseTodayNotificationsReturn {
  expensesToday: NotificationItem[];
  loading: boolean;
  expenseTodayTotal: number;
}

export const useTodayNotifications = (): UseTodayNotificationsReturn => {
  const [expensesToday, setExpensesToday] = useState<NotificationItem[]>([]);
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

      // Get date strings for comparisons
      const todayStr = todayDate.toISOString().split("T")[0];
      const tomorrowStr = tomorrowDate.toISOString().split("T")[0];

      // Fetch expenses only for today
      const { data: expenses } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", todayStr)
        .lt("date", tomorrowStr);

      const todayNotifications: NotificationItem[] = [];

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
        todayNotifications.push(item);
      });

      setExpensesToday(todayNotifications);
      setLoading(false);
    };

    fetchNotifications();
  }, []);

  // Calculate total of today's expenses
  const expenseTodayTotal = expensesToday.reduce((sum, item) => sum + item.amount, 0);

  return {
    expensesToday,
    loading,
    expenseTodayTotal,
  };
};
