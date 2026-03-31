import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import ClientsTable from '@/components/admin/ClientsTable';
import { supabaseAdmin } from '@/integrations/supabase/admin';

interface Client {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
}

export default function AdminClients() {
  const { isAuthenticated, isLoading: authLoading } = useAdminAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchClients();
    }
  }, [isAuthenticated]);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
      const authUsers = authData?.users || [];

      const usersWithEmail = (data || []).map((profile) => {
        const user = authUsers.find((u: { id: string }) => u.id === profile.id);
        return {
          ...profile,
          email: user?.email || 'Sin email',
        };
      });

      setClients(usersWithEmail);
    } catch (error) {
      console.error('Error fetching clients:', error);
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
        <AdminHeader title="Clientes" subtitle="Gestiona todos los clientes registrados" />
        <main className="flex-1 p-6 overflow-auto">
          <ClientsTable
            clients={clients}
            isLoading={isLoading}
            onRefresh={fetchClients}
          />
        </main>
      </div>
    </div>
  );
}
