import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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

const toDateString = (date: Date) => date.toISOString().split("T")[0];

const getLocalDate = (daysToAdd = 0) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + daysToAdd);
  return date;
};

const isPaymentDay = (paymentDays: number[] | null | undefined, day: number, date: Date) => {
  const days = paymentDays && paymentDays.length > 0 ? paymentDays : [1];
  const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  return days.includes(day) || (days.includes(32) && day === lastDayOfMonth);
};

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

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setMovementsToday([]);
      setMovementsTomorrow([]);
      setTotals({
        income: 0,
        expense: 0,
        debt: 0,
        loan: 0,
      });
      setLoading(false);
      return;
    }

    const today = getLocalDate();
    const tomorrow = getLocalDate(1);

    const todayStr = toDateString(today);
    const tomorrowStr = toDateString(tomorrow);

    const todayDay = today.getDate();
    const tomorrowDay = tomorrow.getDate();

    const [
      todayExpensesResult,
      todayIncomesResult,
      todayDebtsResult,
      tomorrowExpensesResult,
      tomorrowIncomesResult,
      tomorrowDebtsResult,
    ] = await Promise.all([
      supabase
        .from("expenses")
        .select("id, amount, description, category, date, start_date, end_date, is_recurring, is_skipped, is_trimmed, payment_days")
        .eq("user_id", session.user.id)
        .eq("is_recurring", true)
        .lte("start_date", todayStr)
        .or(`end_date.is.null,end_date.gte.${todayStr}`),
      supabase
        .from("incomes")
        .select("id, amount, description, category, date, start_date, end_date, is_recurring, is_skipped, payment_days")
        .eq("user_id", session.user.id)
        .eq("is_recurring", true)
        .lte("start_date", todayStr)
        .or(`end_date.is.null,end_date.gte.${todayStr}`),
      supabase
        .from("debts")
        .select("id, name, current_amount, category, payment_days, status")
        .eq("user_id", session.user.id)
        .eq("status", "active"),
      supabase
        .from("expenses")
        .select("id, amount, description, category, date, start_date, end_date, is_recurring, is_skipped, is_trimmed, payment_days")
        .eq("user_id", session.user.id)
        .eq("is_recurring", true)
        .lte("start_date", tomorrowStr)
        .or(`end_date.is.null,end_date.gte.${tomorrowStr}`),
      supabase
        .from("incomes")
        .select("id, amount, description, category, date, start_date, end_date, is_recurring, is_skipped, payment_days")
        .eq("user_id", session.user.id)
        .eq("is_recurring", true)
        .lte("start_date", tomorrowStr)
        .or(`end_date.is.null,end_date.gte.${tomorrowStr}`),
      supabase
        .from("debts")
        .select("id, name, current_amount, category, payment_days, status")
        .eq("user_id", session.user.id)
        .eq("status", "active"),
    ]);

    const todayMovements: NotificationItem[] = [];
    const tomorrowMovements: NotificationItem[] = [];

    if (todayExpensesResult.data) {
      todayExpensesResult.data.forEach((expense) => {
        if (expense.is_skipped || expense.is_trimmed) return;

        if (isPaymentDay(expense.payment_days, todayDay, today)) {
          todayMovements.push({
            id: expense.id,
            type: "expense",
            title: expense.description || expense.category,
            description: expense.category,
            amount: parseFloat(expense.amount || 0),
            date: todayStr,
          });
        }
      });
    }

    if (todayIncomesResult.data) {
      todayIncomesResult.data.forEach((income) => {
        if (income.is_skipped) return;

        if (isPaymentDay(income.payment_days, todayDay, today)) {
          todayMovements.push({
            id: income.id,
            type: "income",
            title: income.description || income.category,
            description: income.category,
            amount: parseFloat(income.amount || 0),
            date: todayStr,
          });
        }
      });
    }

    if (todayDebtsResult.data) {
      todayDebtsResult.data.forEach((debt) => {
        if (isPaymentDay(debt.payment_days, todayDay, today)) {
          todayMovements.push({
            id: debt.id,
            type: "debt",
            title: debt.name,
            description: debt.category || "Deuda",
            amount: parseFloat(debt.current_amount || 0),
            date: todayStr,
          });
        }
      });
    }

    if (tomorrowExpensesResult.data) {
      tomorrowExpensesResult.data.forEach((expense) => {
        if (expense.is_skipped || expense.is_trimmed) return;

        if (isPaymentDay(expense.payment_days, tomorrowDay, tomorrow)) {
          tomorrowMovements.push({
            id: `tomorrow-${expense.id}`,
            type: "expense",
            title: expense.description || expense.category,
            description: expense.category,
            amount: parseFloat(expense.amount || 0),
            date: tomorrowStr,
          });
        }
      });
    }

    if (tomorrowIncomesResult.data) {
      tomorrowIncomesResult.data.forEach((income) => {
        if (income.is_skipped) return;

        if (isPaymentDay(income.payment_days, tomorrowDay, tomorrow)) {
          tomorrowMovements.push({
            id: `tomorrow-${income.id}`,
            type: "income",
            title: income.description || income.category,
            description: income.category,
            amount: parseFloat(income.amount || 0),
            date: tomorrowStr,
          });
        }
      });
    }

    if (tomorrowDebtsResult.data) {
      tomorrowDebtsResult.data.forEach((debt) => {
        if (isPaymentDay(debt.payment_days, tomorrowDay, tomorrow)) {
          tomorrowMovements.push({
            id: `tomorrow-${debt.id}`,
            type: "debt",
            title: debt.name,
            description: debt.category || "Deuda",
            amount: parseFloat(debt.current_amount || 0),
            date: tomorrowStr,
          });
        }
      });
    }

    setMovementsToday(todayMovements);
    setMovementsTomorrow(tomorrowMovements);

    setTotals({
      income: todayMovements
        .filter((movement) => movement.type === "income")
        .reduce((sum, movement) => sum + movement.amount, 0),
      expense: todayMovements
        .filter((movement) => movement.type === "expense")
        .reduce((sum, movement) => sum + movement.amount, 0),
      debt: todayMovements
        .filter((movement) => movement.type === "debt")
        .reduce((sum, movement) => sum + movement.amount, 0),
      loan: todayMovements
        .filter((movement) => movement.type === "loan")
        .reduce((sum, movement) => sum + movement.amount, 0),
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