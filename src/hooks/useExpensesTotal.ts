import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface UseExpensesTotalResult {
  puntualExpenses: number;
  recurrentExpenses: number;
  totalExpenses: number;
  totalLoans: number;
  totalWithLoans: number;
  loading: boolean;
  filteredExpenses: any[];
}

const getMonthlyAmount = (
  amount: number,
  frequency: string,
  recurrenceInterval?: number,
  recurrenceUnit?: string
): number => {
  const numAmount = parseFloat(String(amount)) || 0;
  switch (frequency) {
    case "weekly":
      return numAmount * 4.33;
    case "monthly":
      return numAmount;
    case "quarterly":
      return numAmount / 3;
    case "annual":
      return numAmount / 12;
    case "custom":
      if (recurrenceUnit === "days")
        return (numAmount * 30) / (recurrenceInterval || 1);
      if (recurrenceUnit === "weeks")
        return (numAmount * 4.33) / (recurrenceInterval || 1);
      if (recurrenceUnit === "months")
        return numAmount / (recurrenceInterval || 1);
      return numAmount;
    default:
      return numAmount;
  }
};

export const useExpensesTotal = (
  selectedMonth: string,
  selectedYear: string
): UseExpensesTotalResult => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false);
        return;
      }

      // Fetch ALL expenses for the user (no date filter)
      const { data: expensesData } = await supabase
        .from("expenses")
        .select(
          "amount, date, is_recurring, start_date, frequency, recurrence_interval, recurrence_unit, is_trimmed, is_skipped, description, category"
        )
        .eq("user_id", session.user.id)
        .order("date", { ascending: false });

      if (expensesData) {
        setExpenses(expensesData);
      }

      // Fetch active loans
      const { data: loansData } = await supabase
        .from("loans")
        .select("monthly_payment, status")
        .eq("user_id", session.user.id)
        .eq("status", "active");

      if (loansData) {
        setLoans(loansData);
      }

      setLoading(false);
    };

    fetchData();
  }, [selectedMonth, selectedYear]);

  const monthIndex = Number(selectedMonth) - 1;
  const selectedYearNumber = Number(selectedYear);

  const getOccurrenceDate = (expense: any) => {
    const baseDateValue = expense.start_date || expense.date;
    if (!baseDateValue) return null;

    const baseDate = new Date(baseDateValue + "T00:00:00");
    if (isNaN(baseDate.getTime())) return null;

    if (!expense.is_recurring) {
      return baseDate.getFullYear() === selectedYearNumber && baseDate.getMonth() === monthIndex
        ? baseDate
        : null;
    }

    const recurrenceInterval = expense.recurrence_interval || 1;
    const frequency = expense.frequency || "monthly";

    if (frequency === "monthly") {
      const diffMonths = (selectedYearNumber - baseDate.getFullYear()) * 12 + (monthIndex - baseDate.getMonth());
      if (diffMonths < 0 || diffMonths % recurrenceInterval !== 0) return null;
      return new Date(selectedYearNumber, monthIndex, Math.min(baseDate.getDate(), 31));
    }

    if (frequency === "quarterly") {
      const diffMonths = (selectedYearNumber - baseDate.getFullYear()) * 12 + (monthIndex - baseDate.getMonth());
      if (diffMonths < 0 || diffMonths % (3 * recurrenceInterval) !== 0) return null;
      return new Date(selectedYearNumber, monthIndex, Math.min(baseDate.getDate(), 31));
    }

    if (frequency === "annual") {
      const diffYears = selectedYearNumber - baseDate.getFullYear();
      if (diffYears < 0 || diffYears % recurrenceInterval !== 0) return null;
      return monthIndex === baseDate.getMonth() ? new Date(selectedYearNumber, monthIndex, Math.min(baseDate.getDate(), 31)) : null;
    }

    if (frequency === "weekly") {
      const diffDays = Math.floor((Date.UTC(selectedYearNumber, monthIndex, 1) - Date.UTC(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate())) / 86400000);
      if (diffDays < 0 || diffDays % (7 * recurrenceInterval) !== 0) return null;
      return new Date(selectedYearNumber, monthIndex, 1);
    }

    if (frequency === "custom" && expense.recurrence_unit === "months") {
      const diffMonths = (selectedYearNumber - baseDate.getFullYear()) * 12 + (monthIndex - baseDate.getMonth());
      if (diffMonths < 0 || diffMonths % recurrenceInterval !== 0) return null;
      return new Date(selectedYearNumber, monthIndex, Math.min(baseDate.getDate(), 31));
    }

    return null;
  };

  const filteredExpenses = expenses
    .filter((expense) => !expense.is_skipped)
    .map((expense) => ({
      ...expense,
      occurrenceDate: getOccurrenceDate(expense),
    }))
    .filter((expense) => expense.occurrenceDate !== null)
    .filter((expense) => !expense.is_trimmed)
    .map((expense) => ({
      ...expense,
      date: expense.occurrenceDate.toISOString().slice(0, 10),
    }));

  const puntualExpenses = filteredExpenses
    .filter((e) => !e.is_recurring)
    .reduce((sum, e) => sum + parseFloat(e.amount), 0);

  const recurrentExpenses = filteredExpenses
    .filter((e) => e.is_recurring)
    .reduce(
      (sum, e) =>
        sum +
        getMonthlyAmount(
          parseFloat(e.amount),
          e.frequency,
          e.recurrence_interval,
          e.recurrence_unit
        ),
      0
    );

  // Total expenses without loans
  const totalExpenses = puntualExpenses + recurrentExpenses;

  // Total loans monthly payment (only active loans)
  const totalLoans = loans.reduce(
    (sum, loan) => sum + parseFloat(loan.monthly_payment || 0),
    0
  );

  // Total with loans (unified total)
  const totalWithLoans = totalExpenses + totalLoans;

  return {
    puntualExpenses,
    recurrentExpenses,
    totalExpenses,
    totalLoans,
    totalWithLoans,
    loading,
    filteredExpenses,
  };
};
