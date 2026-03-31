import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import MetricsCard from '@/components/admin/MetricsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, CreditCard, Landmark, TrendingUp, Wallet } from 'lucide-react';
import { supabaseAdmin } from '@/integrations/supabase/admin';

interface Metrics {
  totalUsers: number;
  totalIncomes: number;
  totalExpenses: number;
  totalDebts: number;
  totalInvestments: number;
  totalPatrimony: number;
}

export default function AdminDashboard() {
  const { isAuthenticated, isLoading: authLoading } = useAdminAuth();
  const [metrics, setMetrics] = useState<Metrics>({
    totalUsers: 0,
    totalIncomes: 0,
    totalExpenses: 0,
    totalDebts: 0,
    totalInvestments: 0,
    totalPatrimony: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMetrics();
    }
  }, [isAuthenticated]);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const [
        usersResult,
        incomesResult,
        expensesResult,
        debtsResult,
        investmentsResult,
        patrimonyResult,
      ] = await Promise.all([
        supabaseAdmin.from('profiles').select('id'),
        supabaseAdmin.from('incomes').select('amount'),
        supabaseAdmin.from('expenses').select('amount'),
        supabaseAdmin.from('debts').select('current_amount'),
        supabaseAdmin.from('investments').select('current_value'),
        supabaseAdmin.from('patrimony').select('value'),
      ]);

      const sumField = (data: any[], field: string) =>
        data?.reduce((acc, item) => acc + (parseFloat(item[field]) || 0), 0) || 0;

      setMetrics({
        totalUsers: usersResult.data?.length || 0,
        totalIncomes: sumField(incomesResult.data, 'amount'),
        totalExpenses: sumField(expensesResult.data, 'amount'),
        totalDebts: sumField(debtsResult.data, 'current_amount'),
        totalInvestments: sumField(investmentsResult.data, 'current_value'),
        totalPatrimony: sumField(patrimonyResult.data, 'value'),
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Dashboard" subtitle="Resumen general de FinPro" />
        <main className="flex-1 p-6 overflow-auto">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Métricas Generales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <MetricsCard
                  title="Total Usuarios"
                  value={metrics.totalUsers}
                  icon={Users}
                  color="blue"
                />
                <MetricsCard
                  title="Total Ingresos"
                  value={formatCurrency(metrics.totalIncomes)}
                  icon={DollarSign}
                  color="emerald"
                />
                <MetricsCard
                  title="Total Gastos"
                  value={formatCurrency(metrics.totalExpenses)}
                  icon={CreditCard}
                  color="red"
                />
                <MetricsCard
                  title="Total Deudas"
                  value={formatCurrency(metrics.totalDebts)}
                  icon={Landmark}
                  color="orange"
                />
                <MetricsCard
                  title="Total Inversiones"
                  value={formatCurrency(metrics.totalInvestments)}
                  icon={TrendingUp}
                  color="purple"
                />
                <MetricsCard
                  title="Total Patrimonio"
                  value={formatCurrency(metrics.totalPatrimony)}
                  icon={Wallet}
                  color="emerald"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Balance Financiero General</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <div>
                        <p className="text-sm text-slate-400">Ingresos Totales</p>
                        <p className="text-2xl font-bold text-emerald-400">
                          {formatCurrency(metrics.totalIncomes)}
                        </p>
                      </div>
                      <DollarSign className="h-10 w-10 text-emerald-500/50" />
                    </div>
                    <div className="flex justify-between items-center p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <div>
                        <p className="text-sm text-slate-400">Gastos Totales</p>
                        <p className="text-2xl font-bold text-red-400">
                          {formatCurrency(metrics.totalExpenses)}
                        </p>
                      </div>
                      <CreditCard className="h-10 w-10 text-red-500/50" />
                    </div>
                    <div className="flex justify-between items-center p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
                      <div>
                        <p className="text-sm text-slate-400">Balance Neto</p>
                        <p className={`text-2xl font-bold ${
                          metrics.totalIncomes - metrics.totalExpenses >= 0
                            ? 'text-emerald-400'
                            : 'text-red-400'
                        }`}>
                          {formatCurrency(metrics.totalIncomes - metrics.totalExpenses)}
                        </p>
                      </div>
                      <Wallet className="h-10 w-10 text-slate-500/50" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Resumen de Activos y Pasivos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-slate-400">Activos</p>
                        <TrendingUp className="h-5 w-5 text-purple-500" />
                      </div>
                      <p className="text-2xl font-bold text-purple-400">
                        {formatCurrency(metrics.totalInvestments + metrics.totalPatrimony)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Inversiones + Patrimonio
                      </p>
                    </div>
                    <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-slate-400">Pasivos</p>
                        <Landmark className="h-5 w-5 text-orange-500" />
                      </div>
                      <p className="text-2xl font-bold text-orange-400">
                        {formatCurrency(metrics.totalDebts)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Deudas pendientes
                      </p>
                    </div>
                    <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-slate-400">Patrimonio Neto</p>
                        <Wallet className="h-5 w-5 text-emerald-500" />
                      </div>
                      <p className={`text-2xl font-bold ${
                        (metrics.totalInvestments + metrics.totalPatrimony - metrics.totalDebts) >= 0
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }`}>
                        {formatCurrency(
                          metrics.totalInvestments + metrics.totalPatrimony - metrics.totalDebts
                        )}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Activos - Pasivos
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
