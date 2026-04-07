import { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import ClientDetailTabs from '@/components/admin/ClientDetailTabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { supabaseAdmin } from '@/integrations/supabase/admin';

export default function AdminClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAdminAuth();
  
  const [profile, setProfile] = useState<any>(null);
  const [financialProfile, setFinancialProfile] = useState<any>(null);
  const [monetizationSettings, setMonetizationSettings] = useState<any>(null);
  const [incomes, setIncomes] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [debts, setDebts] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [patrimony, setPatrimony] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [clientEmail, setClientEmail] = useState('');

  useEffect(() => {
    if (isAuthenticated && id) {
      fetchClientData();
    }
  }, [isAuthenticated, id]);

  const fetchClientData = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const [
        profileResult,
        financialResult,
        monetizationResult,
        incomesResult,
        expensesResult,
        debtsResult,
        loansResult,
        investmentsResult,
        patrimonyResult,
        authData,
      ] = await Promise.all([
        supabaseAdmin.from('profiles').select('*').eq('id', id).single(),
        supabaseAdmin.from('user_financial_profiles').select('*').eq('user_id', id).maybeSingle(),
        supabaseAdmin.from('user_monetization_settings').select('*').eq('user_id', id).maybeSingle(),
        supabaseAdmin.from('incomes').select('*').eq('user_id', id).order('date', { ascending: false }),
        supabaseAdmin.from('expenses').select('*').eq('user_id', id).order('date', { ascending: false }),
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
      setFinancialProfile(financialResult.data);
      setMonetizationSettings(monetizationResult.data);
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
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/clients')}
              className="text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a clientes
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
            </div>
          ) : (
            <ClientDetailTabs
              clientId={id!}
              profile={profile}
              financialProfile={financialProfile}
              monetizationSettings={monetizationSettings}
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