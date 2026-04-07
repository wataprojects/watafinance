import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import ClientDetailTabs from '@/components/admin/ClientDetailTabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { supabaseAdmin } from '@/integrations/supabase/admin';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAdminAuth();
  
  // Filtros de fecha
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const currentYear = new Date().getFullYear().toString();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const [profile, setProfile] = useState<any>(null);
  const [incomes, setIncomes] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [debts, setDebts] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [patrimony, setPatrimony] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [clientEmail, setClientEmail] = useState('');

  const months = [
    { value: "01", label: "Enero" }, { value: "02", label: "Febrero" }, { value: "03", label: "Marzo" },
    { value: "04", label: "Abril" }, { value: "05", label: "Mayo" }, { value: "06", label: "Junio" },
    { value: "07", label: "Julio" }, { value: "08", label: "Agosto" }, { value: "09", label: "Septiembre" },
    { value: "10", label: "Octubre" }, { value: "11", label: "Noviembre" }, { value: "12", label: "Diciembre" },
  ];
  const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - i).toString());

  useEffect(() => {
    if (isAuthenticated && id) {
      fetchClientData();
    }
  }, [isAuthenticated, id, selectedMonth, selectedYear]);

  const fetchClientData = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const startDate = `${selectedYear}-${selectedMonth}-01`;
      const lastDay = new Date(parseInt(selectedYear), parseInt(selectedMonth), 0).getDate();
      const endDate = `${selectedYear}-${selectedMonth}-${lastDay}`;

      const [
        profileResult,
        incomesResult,
        expensesResult,
        debtsResult,
        loansResult,
        investmentsResult,
        patrimonyResult,
        authData,
      ] = await Promise.all([
        supabaseAdmin.from('profiles').select('*').eq('id', id).single(),
        supabaseAdmin.from('incomes').select('*').eq('user_id', id).gte('date', startDate).lte('date', endDate).order('date', { ascending: false }),
        supabaseAdmin.from('expenses').select('*').eq('user_id', id).gte('date', startDate).lte('date', endDate).order('date', { ascending: false }),
        supabaseAdmin.from('debts').select('*').eq('user_id', id).order('created_at', { ascending: false }),
        supabaseAdmin.from('loans').select('*').eq('user_id', id).order('created_at', { ascending: false }),
        supabaseAdmin.from('investments').select('*').eq('user_id', id).order('created_at', { ascending: false }),
        supabaseAdmin.from('patrimony').select('*').eq('user_id', id).order('created_at', { ascending: false }),
        supabaseAdmin.auth.admin.getUserById(id),
      ]);

      setClientEmail(authData.data?.user?.email || 'Sin email');
      setProfile({
        ...profileResult.data,
        email: authData.data?.user?.email || 'Sin email',
      });
      setIncomes(incomesResult.data || []);
      setExpenses(expensesResult.data || []);
      setDebts(debtsResult.data || []);
      setLoans(loansResult.data || []);
      setInvestments(investmentsResult.data || []);
      setPatrimony(patrimonyResult.data || []);
    } catch (error) {
      console.error('Error fetching client data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cálculos en tiempo real para el periodo seleccionado
  const stats = useMemo(() => {
    const totalIncome = incomes.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const totalLoansMonthly = loans.filter(l => l.status === 'active').reduce((sum, l) => sum + (parseFloat(l.monthly_payment) || 0), 0);
    
    return {
      totalIncome,
      totalExpenses: totalExpenses + totalLoansMonthly,
      balance: totalIncome - (totalExpenses + totalLoansMonthly),
      savingsRatio: totalIncome > 0 ? ((totalIncome - (totalExpenses + totalLoansMonthly)) / totalIncome) * 100 : 0
    };
  }, [incomes, expenses, loans]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
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
        <AdminHeader
          title={`${profile?.first_name || 'Cliente'} ${profile?.last_name || ''}`}
          subtitle={clientEmail}
        />
        <main className="flex-1 p-6 overflow-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/clients')}
              className="text-slate-400 hover:text-white hover:bg-slate-800 w-fit"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a clientes
            </Button>

            <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-xl border border-slate-800">
              <CalendarIcon className="h-4 w-4 text-emerald-400 ml-2" />
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[130px] bg-transparent border-0 text-white focus:ring-0">
                  <SelectValue placeholder="Mes" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800">
                  {months.map(m => <SelectItem key={m.value} value={m.value} className="text-white">{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[100px] bg-transparent border-0 text-white focus:ring-0">
                  <SelectValue placeholder="Año" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800">
                  {years.map(y => <SelectItem key={y} value={y} className="text-white">{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
            </div>
          ) : (
            <ClientDetailTabs
              clientId={id!}
              profile={profile}
              stats={stats}
              incomes={incomes}
              expenses={expenses}
              debts={debts}
              loans={loans}
              investments={investments}
              patrimony={patrimony}
              onRefresh={fetchClientData}
            />
          )}
        </main>
      </div>
    </div>
  );
}