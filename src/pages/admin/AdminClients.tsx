import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import ClientsTable from '@/components/admin/ClientsTable';
import { supabase } from '@/integrations/supabase/client';
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
      // Invocamos la Edge Function que tiene los permisos necesarios
      const { data, error: funcError } = await supabase.functions.invoke('admin-get-clients');
      
      if (funcError) throw funcError;
      if (data.error) throw new Error(data.error);

      setClients(data || []);
    } catch (err: any) {
      console.error('[AdminClients] Error:', err);
      setError(err.message || 'Error al conectar con el servidor de administración');
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
              <AlertTitle>Error de Conexión</AlertTitle>
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