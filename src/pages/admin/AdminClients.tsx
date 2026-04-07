import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import ClientsTable from '@/components/admin/ClientsTable';
import { supabaseAdmin } from '@/integrations/supabase/admin';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchClients();
    }
  }, [isAuthenticated]);

  const fetchClients = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Obtener todos los usuarios de Auth (fuente de verdad)
      // Usamos un límite alto para asegurar que traemos todos
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers({
        perPage: 1000,
      });
      
      if (authError) {
        console.error('[AdminClients] Error listUsers:', authError);
        throw new Error(`Error al listar usuarios de Auth: ${authError.message}`);
      }
      
      const authUsers = authData?.users || [];

      // 2. Obtener todos los perfiles
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('*');

      if (profilesError) {
        console.error('[AdminClients] Error profiles:', profilesError);
        // No lanzamos error aquí, permitimos que se vean los usuarios de Auth sin perfil
      }

      // 3. Combinar: Mapeamos sobre los usuarios de Auth para asegurar que todos aparezcan
      const combinedUsers = authUsers.map((user) => {
        const profile = profiles?.find((p) => p.id === user.id);
        return {
          id: user.id,
          email: user.email || 'Sin email',
          first_name: profile?.first_name || null,
          last_name: profile?.last_name || null,
          created_at: user.created_at,
        };
      });

      // Ordenar por fecha de creación descendente
      combinedUsers.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setClients(combinedUsers);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado al cargar los clientes');
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
          {error && (
            <Alert variant="destructive" className="mb-6 bg-red-500/10 border-red-500/20 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                {error}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchClients}
                  className="ml-4 border-red-500/50 text-red-400 hover:bg-red-500/20"
                >
                  <RefreshCw className="h-3 w-3 mr-2" /> Reintentar
                </Button>
              </AlertDescription>
            </Alert>
          )}

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