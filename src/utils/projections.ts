import { format, addDays, isAfter, isBefore, startOfMonth, endOfMonth, eachDayOfInterval, getDay, getDate } from "date-fns";

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  is_recurring: boolean;
  frequency?: string;
  recurrence_interval?: number;
  recurrence_unit?: string;
  payment_days?: number[];
  is_passive?: boolean;
  is_trimmed?: boolean;
}

export interface ProjectionResult {
  projectedIncome: number;
  projectedExpenses: number;
  upcomingPayments: Transaction[];
  cashFlowTimeline: { date: string; balance: number }[];
  fixedVsVariable: { fixed: number; variable: number };
  estimatedSavings: number;
  riskAlerts: string[];
}

export const calculateProjections = (
  incomes: Transaction[],
  expenses: Transaction[],
  currentBalance: number = 0
): ProjectionResult => {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const next30Days = eachDayOfInterval({ start: now, end: addDays(now, 30) });

  let projectedIncome = 0;
  let projectedExpenses = 0;
  let fixedExpenses = 0;
  let variableExpenses = 0;

  // Helper to calculate prorated monthly amount
  const getProratedMonthly = (amount: number, frequency: string = 'monthly'): number => {
    switch (frequency) {
      case 'weekly': return amount * 4.33;
      case 'quarterly': return amount / 3;
      case 'annual': return amount / 12;
      case 'monthly':
      default: return amount;
    }
  };

  // Process Incomes
  incomes.forEach(income => {
    if (income.is_recurring) {
      projectedIncome += getProratedMonthly(income.amount, income.frequency);
    } else {
      const incomeDate = new Date(income.date);
      if (incomeDate >= monthStart && incomeDate <= monthEnd) {
        projectedIncome += income.amount;
      }
    }
  });

  // Process Expenses
  expenses.forEach(expense => {
    if (expense.is_trimmed) return;

    if (expense.is_recurring) {
      const monthlyAmount = getProratedMonthly(expense.amount, expense.frequency);
      projectedExpenses += monthlyAmount;
      fixedExpenses += monthlyAmount;
    } else {
      const expenseDate = new Date(expense.date);
      if (expenseDate >= monthStart && expenseDate <= monthEnd) {
        projectedExpenses += expense.amount;
        variableExpenses += expense.amount;
      }
    }
  });

  // Upcoming Payments (next 30 days)
  const upcomingPayments: Transaction[] = [];
  const allTransactions = [...incomes.map(i => ({ ...i, type: 'income' })), ...expenses.map(e => ({ ...e, type: 'expense' }))];

  next30Days.forEach(day => {
    const dayOfMonth = getDate(day);
    const dayOfWeek = getDay(day) === 0 ? 7 : getDay(day); // Map 0-6 (Sun-Sat) to 1-7 (Mon-Sun)

    allTransactions.forEach(t => {
      if (!t.is_recurring || t.is_trimmed) return;

      let isDue = false;
      if (t.frequency === 'monthly' || !t.frequency) {
        if (t.payment_days?.includes(dayOfMonth)) isDue = true;
        // Handle "Last Day" logic if needed (e.g., if 31 is selected and month has 30 days)
        if (t.payment_days?.includes(32) && dayOfMonth === getDate(endOfMonth(day))) isDue = true;
      } else if (t.frequency === 'weekly') {
        if (t.payment_days?.includes(dayOfWeek)) isDue = true;
      }

      if (isDue) {
        upcomingPayments.push({
          ...t,
          date: format(day, 'yyyy-MM-dd')
        } as Transaction);
      }
    });
  });

  // Cash Flow Timeline
  let runningBalance = currentBalance;
  const cashFlowTimeline = next30Days.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayIncomes = upcomingPayments.filter(p => (p as any).type === 'income' && p.date === dateStr);
    const dayExpenses = upcomingPayments.filter(p => (p as any).type === 'expense' && p.date === dateStr);

    dayIncomes.forEach(i => runningBalance += i.amount);
    dayExpenses.forEach(e => runningBalance -= e.amount);

    return { date: dateStr, balance: runningBalance };
  });

  // Risk Alerts
  const riskAlerts: string[] = [];
  if (cashFlowTimeline.some(day => day.balance < 0)) {
    const firstNegativeDay = cashFlowTimeline.find(day => day.balance < 0);
    riskAlerts.push(`Predicción de saldo negativo el ${format(new Date(firstNegativeDay!.date), 'dd/MM')}`);
  }
  if (projectedExpenses > projectedIncome) {
    riskAlerts.push("Los gastos proyectados superan a los ingresos este mes");
  }

  return {
    projectedIncome,
    projectedExpenses,
    upcomingPayments: upcomingPayments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    cashFlowTimeline,
    fixedVsVariable: { fixed: fixedExpenses, variable: variableExpenses },
    estimatedSavings: Math.max(0, projectedIncome - projectedExpenses),
    riskAlerts
  };
};
