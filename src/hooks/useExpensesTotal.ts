import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface UseExpensesTotalResult {
  puntualExpenses: number;
  recurrentExpenses: number;
  totalExpenses: number;
  totalLoans: number;
  totalWithLoans: number;
  loading: boolean;
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
  }, []);

  // Filter expenses by selected period
  const selectedPeriodExpenses = expenses.filter((expense) => {
    if (expense.is_skipped) return false;
    if (!expense.date) return false;

    const expenseDate = new Date(expense.date + "T00:00:00");
    if (isNaN(expenseDate.getTime())) return false;

    const expenseYear = expenseDate.getFullYear().toString();
    const expenseMonth = (expenseDate.getMonth() + 1).toString().padStart(2, "0");

    if (expenseYear !== selectedYear) return false;
    if (expenseMonth !== selectedMonth) return false;

    return true;
  });

  // Filter expenses for display: include puntual expenses, generated recurring occurrences,
  // and recurring templates that don't have a generated occurrence for the same month
  const filteredExpenses = selectedPeriodExpenses.filter((expense) => {
    if (expense.is_trimmed) return false;

    if (expense.is_recurring) {
      const isOriginalTemplate =
        !expense.start_date || expense.start_date === expense.date;

      if (isOriginalTemplate) {
        // Check if there's a generated occurrence for the same month
        const hasGeneratedOccurrenceForSameMonth = selectedPeriodExpenses.some(
          (otherExpense) => {
            if (otherExpense.id === expense.id) return false;
            if (!otherExpense.is_recurring) return false;
            if (
              !otherExpense.start_date ||
              otherExpense.start_date === otherExpense.date
            )
              return false;

            return (
              otherExpense.description === expense.description &&
              otherExpense.category === expense.category
            );
          }
        );

        if (hasGeneratedOccurrenceForSameMonth) {
          return false;
        }
      }
    }

    return true;
  });

  // Calculate puntuales: non-recurring expenses
  const puntualExpenses = filteredExpenses
    .filter((e) => !e.is_recurring)
    .reduce((sum, e) => sum + parseFloat(e.amount), 0);

  // Calculate recurrentes: recurring expenses converted to monthly
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
  };
};
