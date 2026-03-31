import { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import ClientDetailTabs from '@/components/admin/ClientDetailTabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { supabaseAdmin } from '@/integrations/supabase/admin';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  created_at: string;
}

interface Income {
  id: string;
  amount: number;
  description: string | null;
  category: string;
  date: string;
  is_recurring: boolean;
  is_passive: boolean;
}

interface Expense {
  id: string;
  amount: number;
  description: string | null;
  category: string;
  date: string;
  is_recurring: boolean;
}

interface Debt {
  id: string;
  name: string;
  creditor: string | null;
  initial_amount: number;
  current_amount: number;
  interest_rate: number | null;
  monthly_payment: number | null;
  status: string;
  category: string | null;
}

interface Loan {
  id: string;
  borrower_name: string;
  initial_amount: number;
  current_amount: number;
  interest_rate: number | null;
  monthly_payment: number | null;
  status: string;
  bank: string | null;
  loan_type: string | null;
}

interface Investment {
  id: string;
  name: string;
  type: string;
  initial_value: number;
  current_value: number;
  return_percentage: number | null;
  monthly_contribution: number | null;
}

interface Patrimony {
  id: string;
  name: string;
  category: string;
  value: number;
  description: string | null;
}

export default function AdminClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAdminAuth();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [patrimony, setPatrimony] = useState<Patrimony[]>([]);
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
        incomesResult,
        expensesResult,
        debtsResult,
        loansResult,
        investmentsResult,
        patrimonyResult,
        authData,
      ] = await Promise.all([
        supabaseAdmin.from('profiles').select('*').eq('id', id).single(),
        supabaseAdmin.from('incomes').select('*').eq('user_id', id),
        supabaseAdmin.from('expenses').select('*').eq('user_id', id),
        supabaseAdmin.from('debts').select('*').eq('user_id', id),
        supabaseAdmin.from('loans').select('*').eq('user_id', id),
        supabaseAdmin.from('investments').select('*').eq('user_id', id),
        supabaseAdmin.from('patrimony').select('*').eq('user_id', id),
        supabaseAdmin.auth.admin.listUsers(),
      ]);

      const users = (authData as { users?: { id: string; email?: string }[] })?.users || [];
      const user = users.find((u) => u.id === id);
      setClientEmail(user?.email || 'Sin email');

      setProfile({
        ...profileResult.data,
        email: user?.email || 'Sin email',
      } as Profile);
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
              <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <ClientDetailTabs
              clientId={id!}
              profile={profile}
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
