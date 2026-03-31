"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface NotificationItem {
  id: string;
  type: "expense" | "income" | "debt" | "loan";
  title: string;
  description: string;
  amount: number;
  date: Date;
  dayLabel?: "today" | "tomorrow";
}

interface Totals {
  income: number;
  expense: number;
  debt: number;
  loan: number;
}

interface UseTodayNotificationsReturn {
  movementsToday: NotificationItem[];
  movementsTomorrow: NotificationItem[];
  loading: boolean;
  totals: {
    today: Totals;
    tomorrow: Totals;
  };
}

export const useTodayNotifications = (): UseTodayNotificationsReturn => {
  const [movementsToday, setMovementsToday] = useState<NotificationItem[]>([]);
  const [movementsTomorrow, setMovementsTomorrow] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const dayAfterTomorrow = new Date(today);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

      // Get day of month for today and tomorrow
      const todayDay = today.getDate();
      const tomorrowDay = tomorrow.getDate();

      // Fetch expenses for today and tomorrow
      const { data: expenses } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", today.toISOString().split("T")[0])
        .lt("date", dayAfterTomorrow.toISOString().split("T")[0]);

      // Fetch incomes for today and tomorrow
      const { data: incomes } = await supabase
        .from("incomes")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", today.toISOString().split("T")[0])
        .lt("date", dayAfterTomorrow.toISOString().split("T")[0]);

      // Fetch active debts with collection_day for today and tomorrow
      const { data: debts } = await supabase
        .from("debts")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .in("collection_day", [todayDay, tomorrowDay]);

      // Fetch active loans with collection_day for today and tomorrow
      const { data: loans } = await supabase
        .from("loans")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .in("collection_day", [todayDay, tomorrowDay]);

      const todayMovements: NotificationItem[] = [];
      const tomorrowMovements: NotificationItem[] = [];

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
        const tomorrowStr = tomorrow.toISOString().split("T")[0];
        if (itemDateStr < tomorrowStr) {
          item.dayLabel = "today";
          todayMovements.push(item);
        } else {
          item.dayLabel = "tomorrow";
          tomorrowMovements.push(item);
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
        const tomorrowStr = tomorrow.toISOString().split("T")[0];
        if (itemDateStr < tomorrowStr) {
          item.dayLabel = "today";
          todayMovements.push(item);
        } else {
          item.dayLabel = "tomorrow";
          tomorrowMovements.push(item);
        }
      });

      // Process debts
      debts?.forEach((debt: any) => {
        const item: NotificationItem = {
          id: debt.id,
          type: "debt",
          title: debt.name,
          description: debt.creditor ? `Deuda con ${debt.creditor}` : "Deuda",
          amount: Number(debt.monthly_payment || 0),
          date: new Date(),
        };

        if (debt.collection_day === todayDay) {
          item.dayLabel = "today";
          todayMovements.push(item);
        } else if (debt.collection_day === tomorrowDay) {
          item.dayLabel = "tomorrow";
          tomorrowMovements.push(item);
        }
      });

      // Process loans
      loans?.forEach((loan: any) => {
        const item: NotificationItem = {
          id: loan.id,
          type: "loan",
          title: loan.borrower_name,
          description: loan.bank ? `Préstamo con ${loan.bank}` : "Préstamo",
          amount: Number(loan.monthly_payment || 0),
          date: new Date(),
        };

        if (loan.collection_day === todayDay) {
          item.dayLabel = "today";
          todayMovements.push(item);
        } else if (loan.collection_day === tomorrowDay) {
          item.dayLabel = "tomorrow";
          tomorrowMovements.push(item);
        }
      });

      // Sort by amount (largest first)
      const sortByAmount = (a: NotificationItem, b: NotificationItem) => 
        Math.abs(b.amount) - Math.abs(a.amount);

      setMovementsToday(todayMovements.sort(sortByAmount));
      setMovementsTomorrow(tomorrowMovements.sort(sortByAmount));
      setLoading(false);
    };

    fetchNotifications();
  }, []);

  // Calculate totals
  const calculateTotals = (movements: NotificationItem[]) => {
    return movements.reduce(
      (acc, item) => {
        if (item.type === "income" || item.type === "loan") {
          acc.income += item.amount;
        } else if (item.type === "expense" || item.type === "debt") {
          acc.expense += item.amount;
        }
        if (item.type === "debt") acc.debt += item.amount;
        if (item.type === "loan") acc.loan += item.amount;
        return acc;
      },
      { income: 0, expense: 0, debt: 0, loan: 0 }
    );
  };

  const totals = {
    today: calculateTotals(movementsToday),
    tomorrow: calculateTotals(movementsTomorrow),
  };

  return {
    movementsToday,
    movementsTomorrow,
    loading,
    totals,
  };
};