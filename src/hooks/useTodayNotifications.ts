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
  today: NotificationItem[];
  tomorrow: NotificationItem[];
  loading: boolean;
  totalToday: number;
  totalTomorrow: number;
  // New separate totals
  incomeToday: number;
  expenseToday: number;
  incomeTomorrow: number;
  expenseTomorrow: number;
}

export const useTodayNotifications = (): UseTodayNotificationsReturn => {
  const [today, setToday] = useState<NotificationItem[]>([]);
  const [tomorrow, setTomorrow] = useState<NotificationItem[]>([]);
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
      const dayAfterTomorrow = new Date(tomorrowDate);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      // Fetch incomes
      const { data: incomes } = await supabase
        .from("incomes")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", todayDate.toISOString().split("T")[0])
        .lt("date", dayAfterTomorrow.toISOString().split("T")[0]);

      // Fetch expenses
      const { data: expenses } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", todayDate.toISOString().split("T")[0])
        .lt("date", dayAfterTomorrow.toISOString().split("T")[0]);

      // Fetch loans (debts)
      const { data: loans } = await supabase
        .from("loans")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .lte("collection_day", tomorrowDate.getDate());

      const todayNotifications: NotificationItem[] = [];
      const tomorrowNotifications: NotificationItem[] = [];

      // Process incomes
      incomes?.forEach((income: any) => {
        const incomeDate = new Date(income.date);
        const item: NotificationItem = {
          id: income.id,
          type: "income",
          title: income.description || "Ingreso",
          description: `Ingreso ${income.is_passive ? "pasivo" : "regular"}`,
          amount: Number(income.amount),
          date: incomeDate,
        };
        if (incomeDate.toDateString() === todayDate.toDateString()) {
          todayNotifications.push(item);
        } else {
          tomorrowNotifications.push(item);
        }
      });

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
        if (expenseDate.toDateString() === todayDate.toDateString()) {
          todayNotifications.push(item);
        } else {
          tomorrowNotifications.push(item);
        }
      });

      // Process loans
      loans?.forEach((loan: any) => {
        const item: NotificationItem = {
          id: loan.id,
          type: "loan",
          title: loan.borrower_name,
          description: `Cuota: ${loan.bank || "Préstamo"}`,
          amount: Number(loan.monthly_payment),
          date: new Date(),
        };
        tomorrowNotifications.push(item);
      });

      setToday(todayNotifications);
      setTomorrow(tomorrowNotifications);
      setLoading(false);
    };

    fetchNotifications();
  }, []);

  // Calculate totals
  const totalToday = today.reduce((sum, item) => sum + item.amount, 0);
  const totalTomorrow = tomorrow.reduce((sum, item) => sum + item.amount, 0);

  // Calculate separate totals for income and expenses
  const incomeToday = today
    .filter(item => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);

  const expenseToday = today
    .filter(item => item.type === "expense" || item.type === "loan")
    .reduce((sum, item) => sum + item.amount, 0);

  const incomeTomorrow = tomorrow
    .filter(item => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);

  const expenseTomorrow = tomorrow
    .filter(item => item.type === "expense" || item.type === "loan")
    .reduce((sum, item) => sum + item.amount, 0);

  return {
    today,
    tomorrow,
    loading,
    totalToday,
    totalTomorrow,
    incomeToday,
    expenseToday,
    incomeTomorrow,
    expenseTomorrow,
  };
};