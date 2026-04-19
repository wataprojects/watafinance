"use client";

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
  startOfDay,
  parseISO,
  startOfToday
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

const toDateString = (date: Date | string) => {
  if (typeof date === 'string') {
    return date.split('T')[0];
  }
  return format(date, 'yyyy-MM-dd');
};

export const calculateProjections = (
  incomes: Transaction[],
  expenses: Transaction[],
  startingBalance: number = 0,
  startDate: Date = startOfToday(),
  endDate: Date = addDays(startDate, 30)
): ProjectionResult => {
  const today = startOfToday();
  const todayStr = toDateString(today);
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
      isAfter(startOfDay(parseISO(t.date)), sixtyDaysAgo) && 
      isBefore(startOfDay(parseISO(t.date)), today)
    );
    const total = pastVariable.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    return total / 2;
  };

  const avgVariableIncome = calculateVariableAverage(incomes);
  const avgVariableExpenses = calculateVariableAverage(expenses);

  // --- 2. IDENTIFICAR SERIES ÚNICAS ---
  const getUniqueSeries = (transactions: Transaction[]) => {
    const seriesMap = new Map<string, Transaction>();
    const puntuals: Transaction[] = [];

    transactions.forEach(t => {
      if (!t.is_recurring) {
        const tDateStr = toDateString(t.date);
        // Incluimos puntuales que caigan dentro del rango solicitado
        if (tDateStr >= toDateString(startDate) && tDateStr <= toDateString(endDate)) {
          puntuals.push(t);
        }
        return;
      }
      
      const key = `${(t.description || '').toLowerCase()}-${t.category}`;
      const existing = seriesMap.get(key);
      if (!existing || t.date > existing.date) {
        seriesMap.set(key, t);
      }
    });

    return [...puntuals, ...Array.from(seriesMap.values())];
  };

  const uniqueIncomes = getUniqueSeries(incomes);
  const uniqueExpenses = getUniqueSeries(expenses);

  // Helper para calcular ocurrencias en el rango solicitado
  const getOccurrences = (t: Transaction) => {
    const occurrences: { dateStr: string; amount: number }[] = [];
    const amount = Number(t.amount) || 0;
    
    if (!t.is_recurring) {
      const tDateStr = toDateString(t.date);
      if (tDateStr >= toDateString(startDate) && tDateStr <= toDateString(endDate)) {
        occurrences.push({ dateStr: tDateStr, amount });
      }
      return occurrences;
    }

    const paymentDays = (t.payment_days && t.payment_days.length > 0) 
      ? t.payment_days 
      : [parseISO(t.date).getDate()];
      
    const interval = eachDayOfInterval({ start: startDate, end: endDate });

    interval.forEach(day => {
      const dayOfMonth = getDate(day);
      const isLastDayOfMonth = isSameDay(day, endOfMonth(day));
      const isPaymentDay = paymentDays.includes(dayOfMonth) || (paymentDays.includes(32) && isLastDayOfMonth);
      
      const dayStr = toDateString(day);
      const hasNotEnded = !t.end_date || dayStr <= toDateString(t.end_date);

      // Para recurrentes, solo proyectamos si es hoy o futuro, 
      // o si es pasado pero no tenemos un registro real (esto es complejo, simplificamos a futuro)
      if (isPaymentDay && hasNotEnded && !t.is_skipped && !t.is_trimmed) {
        occurrences.push({ dateStr: dayStr, amount });
      }
    });

    return occurrences;
  };

  // Procesar Ingresos
  uniqueIncomes.forEach(income => {
    getOccurrences(income).forEach(occ => {
      projectedIncome += occ.amount;
      upcomingPayments.push({ ...income, date: occ.dateStr, type: 'income' });
    });
  });

  // Procesar Gastos
  uniqueExpenses.forEach(expense => {
    getOccurrences(expense).forEach(occ => {
      projectedExpenses += occ.amount;
      upcomingPayments.push({ ...expense, date: occ.dateStr, type: 'expense' });
      
      const isFixed = expense.is_recurring || ['housing', 'loans', 'electricity', 'water', 'internet', 'subscriptions', 'insurance'].includes(expense.category);
      if (isFixed) fixedExpenses += occ.amount;
      else variableExpenses += occ.amount;
    });
  });

  // --- 3. TIMELINE ---
  const timeline: { date: string; balance: number }[] = [];
  let currentBalance = startingBalance;
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  const dailyVar = (avgVariableIncome - avgVariableExpenses) / 30;

  days.forEach(day => {
    const dayStr = toDateString(day);
    
    upcomingPayments.filter(t => t.date === dayStr).forEach(t => {
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
    upcomingPayments: upcomingPayments.sort((a, b) => a.date.localeCompare(b.date)),
    riskAlerts,
    fixedVsVariable: { fixed: fixedExpenses, variable: variableExpenses }
  };
};