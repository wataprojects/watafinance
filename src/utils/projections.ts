import { 
  addDays, 
  isAfter, 
  isBefore, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  format,
  getDate,
  isSameDay,
  subDays,
  startOfToday,
  startOfDay
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
  const today = startOfToday();
  const thirtyDaysFromNow = addDays(today, 30);
  const sixtyDaysAgo = subDays(today, 60);
  
  let projectedIncome = 0;
  let projectedExpenses = 0;
  let fixedExpenses = 0;
  let variableExpenses = 0;
  const upcomingPayments: Transaction[] = [];
  const riskAlerts: string[] = [];

  // --- 1. PROMEDIOS VARIABLES ---
  const calculateVariableAverage = (transactions: Transaction[]) => {
    const pastVariable = transactions.filter(t => 
      !t.is_recurring && 
      isAfter(startOfDay(new Date(t.date)), sixtyDaysAgo) && 
      isBefore(startOfDay(new Date(t.date)), today)
    );
    const total = pastVariable.reduce((sum, t) => sum + t.amount, 0);
    return total / 2;
  };

  const avgVariableIncome = calculateVariableAverage(incomes);
  const avgVariableExpenses = calculateVariableAverage(expenses);

  // --- 2. IDENTIFICAR SERIES ÚNICAS ---
  // Agrupamos por descripción para no duplicar proyecciones de la misma serie
  const getUniqueSeries = (transactions: Transaction[]) => {
    const seriesMap = new Map<string, Transaction>();
    const puntuals: Transaction[] = [];

    transactions.forEach(t => {
      if (!t.is_recurring) {
        const tDate = startOfDay(new Date(t.date));
        if (isSameDay(tDate, today) || isAfter(tDate, today)) {
          puntuals.push(t);
        }
        return;
      }
      
      const key = `${t.description?.toLowerCase()}-${t.category}`;
      const existing = seriesMap.get(key);
      if (!existing || new Date(t.date) > new Date(existing.date)) {
        seriesMap.set(key, t);
      }
    });

    return [...puntuals, ...Array.from(seriesMap.values())];
  };

  const uniqueIncomes = getUniqueSeries(incomes);
  const uniqueExpenses = getUniqueSeries(expenses);

  // Helper para calcular ocurrencias
  const getOccurrences = (t: Transaction) => {
    const occurrences: { date: Date; amount: number }[] = [];
    
    if (!t.is_recurring) {
      const tDate = startOfDay(new Date(t.date));
      if ((isSameDay(tDate, today) || isAfter(tDate, today)) && isBefore(tDate, thirtyDaysFromNow)) {
        occurrences.push({ date: tDate, amount: t.amount });
      }
      return occurrences;
    }

    // Para recurrentes, si no hay días de pago, usamos el día del registro original
    const paymentDays = (t.payment_days && t.payment_days.length > 0) 
      ? t.payment_days 
      : [new Date(t.date).getDate()];
      
    const interval = eachDayOfInterval({ start: today, end: thirtyDaysFromNow });

    interval.forEach(day => {
      const dayOfMonth = getDate(day);
      const isLastDayOfMonth = isSameDay(day, endOfMonth(day));
      const isPaymentDay = paymentDays.includes(dayOfMonth) || (paymentDays.includes(32) && isLastDayOfMonth);
      
      const hasNotEnded = !t.end_date || isBefore(startOfDay(day), startOfDay(new Date(t.end_date)));

      if (isPaymentDay && hasNotEnded && !t.is_skipped && !t.is_trimmed) {
        occurrences.push({ date: day, amount: t.amount });
      }
    });

    return occurrences;
  };

  // Procesar todo
  uniqueIncomes.forEach(income => {
    getOccurrences(income).forEach(occ => {
      projectedIncome += occ.amount;
      upcomingPayments.push({ ...income, date: occ.date.toISOString(), type: 'income' });
    });
  });

  uniqueExpenses.forEach(expense => {
    getOccurrences(expense).forEach(occ => {
      projectedExpenses += occ.amount;
      upcomingPayments.push({ ...expense, date: occ.date.toISOString(), type: 'expense' });
      
      const isFixed = expense.is_recurring || ['housing', 'loans', 'electricity', 'water', 'internet', 'subscriptions', 'insurance'].includes(expense.category);
      if (isFixed) fixedExpenses += occ.amount;
      else variableExpenses += occ.amount;
    });
  });

  projectedIncome += avgVariableIncome;
  projectedExpenses += avgVariableExpenses;
  variableExpenses += avgVariableExpenses;

  // --- 3. TIMELINE ---
  const timeline: { date: string; balance: number }[] = [];
  let currentBalance = startingBalance;
  const days = eachDayOfInterval({ start: today, end: thirtyDaysFromNow });
  const dailyVar = (avgVariableIncome - avgVariableExpenses) / 30;

  days.forEach(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    upcomingPayments.filter(t => format(new Date(t.date), 'yyyy-MM-dd') === dayStr).forEach(t => {
      if (t.type === 'income') currentBalance += t.amount;
      else currentBalance -= t.amount;
    });
    currentBalance += dailyVar;
    timeline.push({ date: dayStr, balance: currentBalance });
    
    if (currentBalance < 0 && !riskAlerts.some(a => a.includes("saldo negativo"))) {
      riskAlerts.push(`Riesgo de saldo negativo detectado el ${format(day, 'dd/MM')}.`);
    }
  });

  if (projectedIncome > 0 && (projectedIncome - projectedExpenses) / projectedIncome < 0.05) {
    riskAlerts.push("Tu capacidad de ahorro proyectada es muy baja.");
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