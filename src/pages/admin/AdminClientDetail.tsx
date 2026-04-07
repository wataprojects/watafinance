import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import ClientDetailTabs from '@/components/admin/ClientDetailTabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Calendar as CalendarIcon, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AdminClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAdminAuth();
  
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
  const [error, setError] = useState<string | null>(null);

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
    setError(null);
    try {
      // Invocamos la Edge Function para obtener todos los datos del cliente de forma segura
      const { data, error: funcError } = await supabase.functions.invoke('admin-get-client-data', {
        body: { 
          userId: id,
          month: selectedMonth,
          year: selectedYear
        }
      });

      if (funcError) throw funcError;
      if (data.error) throw new Error(data.error);

      setProfile({
        ...data.profile,
        email: data.auth?.email || 'Sin email',
      });
      setIncomes(data.incomes || []);
      setExpenses(data.expenses || []);
      setDebts(data.debts || []);
      setLoans(data.loans || []);
      setInvestments(data.investments || []);
      setPatrimony(data.patrimony || []);
      
    } catch (err: any) {
      console.error('[AdminClientDetail] Error:', err);
      setError(err.message || 'Error al cargar los datos del cliente');
    } finally {
      setIsLoading(false);
    }
  };

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
          title={profile ? `${profile.first_name || 'Cliente'} ${profile.last_name || ''}` : 'Cargando...'}
          subtitle={profile?.email}
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

          {error && (
            <Alert variant="destructive" className="mb-6 bg-red-500/10 border-red-500/20 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error al cargar datos</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                {error}
                <Button variant="outline" size="sm" onClick={fetchClientData} className="ml-4 border-red-500/50 text-red-400 hover:bg-red-500/20">
                  <RefreshCw className="h-3 w-3 mr-2" /> Reintentar
                </Button>
              </AlertDescription>
            </Alert>
          )}

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