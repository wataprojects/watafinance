import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import MetricsCard from '@/components/admin/MetricsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, CreditCard, Landmark, TrendingUp, Wallet, Clock, ChevronRight } from 'lucide-react';
import { supabaseAdmin } from '@/integrations/supabase/admin';
import { formatCurrency } from '@/utils/currency';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface Metrics {
  totalUsers: number;
  totalIncomes: number;
  totalExpenses: number;
  totalDebts: number;
  totalInvestments: number;
  totalPatrimony: number;
}

interface RecentClient {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAdminAuth();
  const [metrics, setMetrics] = useState<Metrics>({
    totalUsers: 0,
    totalIncomes: 0,
    totalExpenses: 0,
    totalDebts: 0,
    totalInvestments: 0,
    totalPatrimony: 0,
  });
  const [recentClients, setRecentClients] = useState<RecentClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [
        usersResult,
        incomesResult,
        expensesResult,
        debtsResult,
        investmentsResult,
        patrimonyResult,
        authData,
      ] = await Promise.all([
        supabaseAdmin.from('profiles').select('id, first_name, last_name, created_at').order('created_at', { ascending: false }).limit(5),
        supabaseAdmin.from('incomes').select('amount'),
        supabaseAdmin.from('expenses').select('amount'),
        supabaseAdmin.from('debts').select('current_amount'),
        supabaseAdmin.from('investments').select('current_value'),
        supabaseAdmin.from('patrimony').select('value'),
        supabaseAdmin.auth.admin.listUsers(),
      ]);

      const sumField = (data: any[], field: string) =>
        data?.reduce((acc, item) => acc + (parseFloat(item[field]) || 0), 0) || 0;

      setMetrics({
        totalUsers: authData.data?.users?.length || 0,
        totalIncomes: sumField(incomesResult.data || [], 'amount'),
        totalExpenses: sumField(expensesResult.data || [], 'amount'),
        totalDebts: sumField(debtsResult.data || [], 'current_amount'),
        totalInvestments: sumField(investmentsResult.data || [], 'current_value'),
        totalPatrimony: sumField(patrimonyResult.data || [], 'value'),
      });

      const authUsers = authData.data?.users || [];
      const clientsWithEmail = (usersResult.data || []).map(profile => {
        const user = authUsers.find(u => u.id === profile.id);
        return {
          ...profile,
          email: user?.email || 'Sin email'
        };
      });
      setRecentClients(clientsWithEmail);

    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setIsLoading(false);
    }
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <MetricsCard title="Usuarios" value={metrics.totalUsers} icon={Users} color="blue" />
              <MetricsCard title="Ingresos" value={formatCurrency(metrics.totalIncomes)} icon={DollarSign} color="emerald" />
              <MetricsCard title="Gastos" value={formatCurrency(metrics.totalExpenses)} icon={CreditCard} color="red" />
              <MetricsCard title="Deudas" value={formatCurrency(metrics.totalDebts)} icon={Landmark} color="orange" />
              <MetricsCard title="Inversiones" value={formatCurrency(metrics.totalInvestments)} icon={TrendingUp} color="purple" />
              <MetricsCard title="Patrimonio" value={formatCurrency(metrics.totalPatrimony)} icon={Wallet} color="emerald" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 bg-slate-900/50 border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="h-5 w-5 text-emerald-400" />
                    Clientes Recientes
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/admin/clients')} className="text-emerald-400 hover:text-emerald-300">
                    Ver todos
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentClients.map((client) => (
                      <div key={client.id} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-slate-800 hover:border-slate-700 transition-all cursor-pointer" onClick={() => navigate(`/admin/clients/${client.id}`)}>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-slate-700">
                            <AvatarFallback className="bg-emerald-500 text-white">
                              {(client.first_name?.charAt(0) || 'U').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-white">{client.first_name || 'Usuario'} {client.last_name || ''}</p>
                            <p className="text-xs text-slate-500">{client.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-xs text-slate-500">
                            {new Date(client.created_at).toLocaleDateString()}
                          </p>
                          <ChevronRight className="h-4 w-4 text-slate-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Balance Global</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Ingresos vs Gastos</span>
                      <span className="text-emerald-400 font-medium">
                        {((metrics.totalIncomes / (metrics.totalIncomes + metrics.totalExpenses)) * 100 || 0).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden flex">
                      <div className="h-full bg-emerald-500" style={{ width: `${(metrics.totalIncomes / (metrics.totalIncomes + metrics.totalExpenses)) * 100 || 0}%` }} />
                      <div className="h-full bg-red-500" style={{ width: `${(metrics.totalExpenses / (metrics.totalIncomes + metrics.totalExpenses)) * 100 || 0}%` }} />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400">Patrimonio Neto Global</span>
                      <span className="text-lg font-bold text-white">
                        {formatCurrency(metrics.totalInvestments + metrics.totalPatrimony - metrics.totalDebts)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400">Ahorro Potencial Global</span>
                      <span className="text-lg font-bold text-emerald-400">
                        {formatCurrency(metrics.totalIncomes - metrics.totalExpenses)}
                      </span>
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