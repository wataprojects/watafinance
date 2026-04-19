"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateProjections, Transaction } from "@/utils/projections";
import { formatCurrency } from "@/utils/currency";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  Info
} from "lucide-react";
import { format, isAfter, isBefore, startOfMonth, endOfMonth, isSameDay, startOfDay, parseISO, startOfToday, addDays } from "date-fns";
import { es } from "date-fns/locale";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FinancialProjectionsProps {
  incomes: any[];
  expenses: any[];
  loans: any[];
  selectedMonth: string;
  selectedYear: string;
}

const FinancialProjections: React.FC<FinancialProjectionsProps> = ({ 
  incomes, 
  expenses, 
  loans,
  selectedMonth,
  selectedYear
}) => {
  // Definimos el rango del mes seleccionado
  const monthStart = useMemo(() => startOfDay(new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, 1)), [selectedMonth, selectedYear]);
  const monthEnd = useMemo(() => endOfMonth(monthStart), [monthStart]);
  const today = startOfToday();

  // Calculamos el saldo inicial REAL (todo lo acumulado antes de este mes)
  const initialBalance = useMemo(() => {
    const pastIncomes = incomes
      .filter(i => isBefore(startOfDay(parseISO(i.date)), monthStart))
      .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
      
    const pastExpenses = expenses
      .filter(e => isBefore(startOfDay(parseISO(e.date)), monthStart))
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      
    return pastIncomes - pastExpenses;
  }, [incomes, expenses, monthStart]);

  // Convertimos préstamos a gastos recurrentes
  const loanExpenses = useMemo(() => loans.map(loan => ({
    id: loan.id,
    amount: parseFloat(loan.monthly_payment || 0),
    description: `Préstamo: ${loan.borrower_name || loan.bank || 'Sin nombre'}`,
    category: 'loans',
    date: monthStart.toISOString(),
    is_recurring: true,
    frequency: 'monthly',
    payment_days: [loan.collection_day || 1],
  })), [loans, monthStart]);

  const allExpenses = useMemo(() => [...expenses, ...loanExpenses], [expenses, loanExpenses]);

  // Calculamos la proyección para el mes seleccionado completo
  const projections = useMemo(() => {
    return calculateProjections(incomes, allExpenses, initialBalance, monthStart, monthEnd);
  }, [incomes, allExpenses, initialBalance, monthStart, monthEnd]);

  // Filtramos los movimientos que caen en el mes seleccionado
  const monthMovements = useMemo(() => {
    return projections.upcomingPayments.filter(p => {
      const pDate = startOfDay(parseISO(p.date));
      return (isSameDay(pDate, monthStart) || isAfter(pDate, monthStart)) && 
             (isSameDay(pDate, monthEnd) || isBefore(pDate, monthEnd));
    });
  }, [projections.upcomingPayments, monthStart, monthEnd]);

  // Totales del mes (Realizado + Previsto)
  const monthIncomes = monthMovements.filter(m => m.type === 'income').reduce((sum, m) => sum + m.amount, 0);
  const monthExpenses = monthMovements.filter(m => m.type === 'expense').reduce((sum, m) => sum + m.amount, 0);
  const monthSavings = Math.max(0, monthIncomes - monthExpenses);

  // Timeline filtrado para el mes
  const monthTimeline = projections.cashFlowTimeline;

  const monthName = format(monthStart, 'MMMM', { locale: es });

  // Próximos 7 días (solo si estamos en el mes actual o futuro)
  const next7Days = useMemo(() => {
    const sevenDaysFromNow = addDays(today, 7);
    return monthMovements.filter(p => {
      const pDate = startOfDay(parseISO(p.date));
      return (isSameDay(pDate, today) || isAfter(pDate, today)) && 
             (isSameDay(pDate, sevenDaysFromNow) || isBefore(pDate, sevenDaysFromNow));
    });
  }, [monthMovements, today]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Resumen del Mes */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2 capitalize">
                <Clock className="w-4 h-4" />
                Proyección de {monthName}
              </CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3.5 h-3.5 text-zinc-600" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-300 text-[10px] max-w-[200px]">
                    Muestra el balance total esperado al finalizar el mes, sumando lo ya gastado y lo que falta por venir.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-zinc-500">Ingresos totales</p>
                <p className="text-xl font-bold text-green-500">{formatCurrency(monthIncomes)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-500">Gastos totales</p>
                <p className="text-xl font-bold text-red-500">{formatCurrency(monthExpenses)}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-zinc-800">
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Ahorro esperado</span>
                <span className="text-lg font-bold text-white">{formatCurrency(monthSavings)}</span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-green-500 h-full transition-all" 
                  style={{ width: `${Math.min(100, monthIncomes > 0 ? (monthSavings / monthIncomes) * 100 : 0)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Análisis de Riesgo */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Salud del Flujo de Caja
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {monthTimeline.some(d => d.balance < 0) ? (
              <div className="flex items-start gap-3 p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-red-200 leading-tight">
                  ¡Atención! Se prevé que tu saldo sea negativo en algunos días de este mes. Revisa tus próximos pagos.
                </p>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <TrendingUp className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-green-200">Tu saldo se mantendrá positivo durante todo el mes. ¡Buen trabajo!</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="p-2 bg-zinc-800/50 rounded-lg border border-zinc-700">
                <p className="text-[10px] text-zinc-500 uppercase">Saldo Inicial</p>
                <p className="text-sm font-bold text-white">{formatCurrency(initialBalance)}</p>
              </div>
              <div className="p-2 bg-zinc-800/50 rounded-lg border border-zinc-700">
                <p className="text-[10px] text-zinc-500 uppercase">Saldo Final Est.</p>
                <p className="text-sm font-bold text-cyan-400">
                  {formatCurrency(monthTimeline[monthTimeline.length - 1]?.balance || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Payments */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Próximos Movimientos (7 días)
            </CardTitle>
            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
              {next7Days.length} programados
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {next7Days.length > 0 ? (
            <div className="space-y-3">
              {next7Days.map((payment, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      payment.type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                      {payment.type === 'income' ? (
                        <ArrowUpRight className={`w-4 h-4 text-green-500`} />
                      ) : (
                        <ArrowDownRight className={`w-4 h-4 text-red-500`} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{payment.description}</p>
                      <p className="text-[10px] text-zinc-500">
                        {format(parseISO(payment.date), "EEEE d 'de' MMMM", { locale: es })}
                      </p>
                    </div>
                  </div>
                  <p className={`text-sm font-bold ${payment.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                    {payment.type === 'income' ? '+' : '-'}{formatCurrency(payment.amount)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-xs text-zinc-500">No hay movimientos programados para la próxima semana.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cash Flow Timeline */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Evolución del Saldo en {monthName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-end gap-1 pt-4">
            {monthTimeline.map((day, i) => {
              const balances = monthTimeline.map(d => d.balance);
              const maxBalance = Math.max(...balances, 1);
              const minBalance = Math.min(...balances, 0);
              const range = maxBalance - minBalance;
              const height = ((day.balance - minBalance) / (range || 1)) * 100;
              
              const isPast = isBefore(startOfDay(parseISO(day.date)), today);
              
              return (
                <div 
                  key={i} 
                  className={`flex-1 rounded-t-sm transition-all hover:opacity-80 group relative ${
                    day.balance < 0 ? 'bg-red-500' : isPast ? 'bg-green-500' : 'bg-green-500/30'
                  }`}
                  style={{ height: `${Math.max(5, height)}%` }}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                    <div className="bg-zinc-800 text-white text-[10px] px-2 py-1 rounded border border-zinc-700 whitespace-nowrap">
                      {format(parseISO(day.date), 'dd/MM')}: {formatCurrency(day.balance)}
                      {isPast ? ' (Real)' : ' (Est.)'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-zinc-500">
            <span>Día 1</span>
            <span>Día 15</span>
            <span>Día {monthTimeline.length}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialProjections;