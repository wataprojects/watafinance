import { 
  addDays, 
  isAfter, 
  isBefore, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  format,
  getDate,
  isSameDay
} from "date-fns";

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  is_recurring?: boolean;
  frequency?: string;
  payment_days?: number[];
  type?: 'income' | 'expense';
  is_skipped?: boolean;
  is_trimmed?: boolean;
  end_date?: string | null;
}

export interface ProjectionResult {
  projectedIncome: number;
  projectedExpenses: number;
  estimatedSavings: number;
  cashFlowTimeline: { date: string; balance: number }[];
  upcomingPayments: Transaction[];
  riskAlerts: string[];
  fixedVsVariable: { fixed: number; variable: number };
}

export const calculateProjections = (
  incomes: Transaction[],
  expenses: Transaction[],
  startingBalance: number = 0
): ProjectionResult => {
  const today = new Date();
  const thirtyDaysFromNow = addDays(today, 30);
  
  let projectedIncome = 0;
  let projectedExpenses = 0;
  let fixedExpenses = 0;
  let variableExpenses = 0;
  const upcomingPayments: Transaction[] = [];
  const riskAlerts: string[] = [];

  // Helper to check if a recurring transaction falls within the next 30 days
  const getOccurrencesInNext30Days = (t: Transaction, type: 'income' | 'expense') => {
    const occurrences: { date: Date; amount: number }[] = [];
    
    if (!t.is_recurring) {
      const tDate = new Date(t.date);
      if (isAfter(tDate, today) && isBefore(tDate, thirtyDaysFromNow)) {
        occurrences.push({ date: tDate, amount: t.amount });
      }
      return occurrences;
    }

    // For recurring transactions
    const paymentDays = t.payment_days || [new Date(t.date).getDate()];
    const interval = eachDayOfInterval({ start: today, end: thirtyDaysFromNow });

    interval.forEach(day => {
      const dayOfMonth = getDate(day);
      const isPaymentDay = paymentDays.includes(dayOfMonth) || 
                          (paymentDays.includes(32) && isSameDay(day, endOfMonth(day)));
      
      // Check if the series hasn't ended
      const hasNotEnded = !t.end_date || isBefore(day, new Date(t.end_date));

      if (isPaymentDay && hasNotEnded && !t.is_skipped && !t.is_trimmed) {
        occurrences.push({ date: day, amount: t.amount });
      }
    });

    return occurrences;
  };

  // Process Incomes
  incomes.forEach(income => {
    const occurrences = getOccurrencesInNext30Days(income, 'income');
    occurrences.forEach(occ => {
      projectedIncome += occ.amount;
      upcomingPayments.push({ ...income, date: occ.date.toISOString(), type: 'income' });
    });
  });

  // Process Expenses
  expenses.forEach(expense => {
    const occurrences = getOccurrencesInNext30Days(expense, 'expense');
    occurrences.forEach(occ => {
      projectedExpenses += occ.amount;
      upcomingPayments.push({ ...expense, date: occ.date.toISOString(), type: 'expense' });
      
      // Categorize as fixed or variable (more accurate logic)
      const essentialCategories = ['housing', 'loans', 'electricity', 'water', 'internet', 'subscriptions', 'insurance', 'security', 'gas'];
      const isEssential = essentialCategories.includes(expense.category);
      
      if (expense.is_recurring || isEssential) {
        fixedExpenses += occ.amount;
      } else {
        variableExpenses += occ.amount;
      }
    });
  });

  // Generate Timeline
  const timeline: { date: string; balance: number }[] = [];
  let currentBalance = startingBalance;
  
  const days = eachDayOfInterval({ start: today, end: thirtyDaysFromNow });
  
  days.forEach(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const daysTransactions = upcomingPayments.filter(t => 
      format(new Date(t.date), 'yyyy-MM-dd') === dayStr
    );

    daysTransactions.forEach(t => {
      if (t.type === 'income') currentBalance += t.amount;
      else currentBalance -= t.amount;
    });

    timeline.push({ date: dayStr, balance: currentBalance });
    
    if (currentBalance < 0 && !riskAlerts.some(a => a.includes("saldo negativo"))) {
      riskAlerts.push(`Riesgo de saldo negativo detectado alrededor del ${format(day, 'dd/MM')}.`);
    }
  });

  // Additional Risk Analysis - More realistic thresholds
  const savingsRate = projectedIncome > 0 ? (projectedIncome - projectedExpenses) / projectedIncome : 0;
  
  // Only alert if savings rate is very low (less than 5%)
  if (savingsRate < 0.05 && projectedIncome > 0) {
    riskAlerts.push("Tu capacidad de ahorro proyectada es muy baja (menor al 5%).");
  }

  // Only alert if fixed expenses are extremely high (more than 85%)
  if (fixedExpenses > projectedIncome * 0.85) {
    riskAlerts.push("Tus gastos fijos son muy elevados respecto a tus ingresos.");
  }

  return {
    projectedIncome,
    projectedExpenses,
    estimatedSavings: Math.max(0, projectedIncome - projectedExpenses),
    cashFlowTimeline: timeline,
    upcomingPayments: upcomingPayments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    riskAlerts,
    fixedVsVariable: { fixed: fixedExpenses, variable: variableExpenses }
  };
};