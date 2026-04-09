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
  Wallet
} from "lucide-react";
import { format, isAfter, isBefore, addDays } from "date-fns";
import { es } from "date-fns/locale";

interface FinancialProjectionsProps {
  incomes: any[];
  expenses: any[];
  loans: any[];
}

const FinancialProjections: React.FC<FinancialProjectionsProps> = ({ incomes, expenses, loans }) => {
  // Convert loans to recurring expenses for projection
  const loanExpenses = useMemo(() => loans.map(loan => ({
    id: loan.id,
    amount: parseFloat(loan.monthly_payment || 0),
    description: loan.name,
    category: 'loan',
    date: new Date().toISOString(),
    is_recurring: true,
    frequency: 'monthly',
    payment_days: [1], // Default to 1st of month for loans
  })), [loans]);

  const allExpenses = useMemo(() => [...expenses, ...loanExpenses], [expenses, loanExpenses]);

  const projections = useMemo(() => {
    return calculateProjections(incomes, allExpenses, 0); // Assuming 0 starting balance for simplicity
  }, [incomes, allExpenses]);

  const next7Days = projections.upcomingPayments.filter(p =>
    isAfter(new Date(p.date), new Date()) &&
    isBefore(new Date(p.date), addDays(new Date(), 7))
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Projected Totals */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Proyección Mensual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-zinc-500">Ingresos esperados</p>
                <p className="text-xl font-bold text-green-500">{formatCurrency(projections.projectedIncome)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-500">Gastos esperados</p>
                <p className="text-xl font-bold text-red-500">{formatCurrency(projections.projectedExpenses)}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-zinc-800">
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Capacidad de ahorro</span>
                <span className="text-lg font-bold text-white">{formatCurrency(projections.estimatedSavings)}</span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-green-500 h-full transition-all" 
                  style={{ width: `${Math.min(100, (projections.estimatedSavings / projections.projectedIncome) * 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insights & Alerts */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Alertas y Riesgos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {projections.riskAlerts.length > 0 ? (
              projections.riskAlerts.map((alert, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-200">{alert}</p>
                </div>
              ))
            ) : (
              <div className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <TrendingUp className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-green-200">Tu flujo de caja parece saludable para los próximos 30 días.</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="p-2 bg-zinc-800/50 rounded-lg border border-zinc-700">
                <p className="text-[10px] text-zinc-500 uppercase">Gastos Fijos</p>
                <p className="text-sm font-bold text-white">{formatCurrency(projections.fixedVsVariable.fixed)}</p>
              </div>
              <div className="p-2 bg-zinc-800/50 rounded-lg border border-zinc-700">
                <p className="text-[10px] text-zinc-500 uppercase">Gastos Variables</p>
                <p className="text-sm font-bold text-white">{formatCurrency(projections.fixedVsVariable.variable)}</p>
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
              Próximos Pagos (7 días)
            </CardTitle>
            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
              {next7Days.length} pendientes
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
                      (payment as any).type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                      {(payment as any).type === 'income' ? (
                        <ArrowUpRight className={`w-4 h-4 text-green-500`} />
                      ) : (
                        <ArrowDownRight className={`w-4 h-4 text-red-500`} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{payment.description}</p>
                      <p className="text-[10px] text-zinc-500">
                        {format(new Date(payment.date), "EEEE d 'de' MMMM", { locale: es })}
                      </p>
                    </div>
                  </div>
                  <p className={`text-sm font-bold ${(payment as any).type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                    {(payment as any).type === 'income' ? '+' : '-'}{formatCurrency(payment.amount)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-xs text-zinc-500">No hay pagos programados para la próxima semana.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cash Flow Timeline */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Evolución de Saldo (30 días)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-end gap-1 pt-4">
            {projections.cashFlowTimeline.map((day, i) => {
              const maxBalance = Math.max(...projections.cashFlowTimeline.map(d => d.balance), 1);
              const height = (day.balance / maxBalance) * 100;
              return (
                <div 
                  key={i} 
                  className={`flex-1 rounded-t-sm transition-all hover:opacity-80 group relative ${
                    day.balance < 0 ? 'bg-red-500' : 'bg-green-500/40'
                  }`}
                  style={{ height: `${Math.max(5, Math.abs(height))}%` }}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                    <div className="bg-zinc-800 text-white text-[10px] px-2 py-1 rounded border border-zinc-700 whitespace-nowrap">
                      {format(new Date(day.date), 'dd/MM')}: {formatCurrency(day.balance)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-zinc-500">
            <span>Hoy</span>
            <span>+15 días</span>
            <span>+30 días</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialProjections;
