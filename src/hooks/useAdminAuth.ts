import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Admin {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
}

interface AdminAuthContextType {
  admin: Admin | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const ADMIN_SESSION_KEY = 'finpro_admin_session';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedSession = localStorage.getItem(ADMIN_SESSION_KEY);
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        setAdmin(session.admin);
      } catch {
        localStorage.removeItem(ADMIN_SESSION_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();

      console.log('[AdminAuth] Intentando login para:', cleanEmail);

      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('email', cleanEmail)
        .eq('password_hash', cleanPassword)
        .maybeSingle();

      if (error) {
        console.error('[AdminAuth] Error de base de datos:', error);
        return { success: false, error: `Error de base de datos: ${error.message}` };
      }

      if (!data) {
        console.warn('[AdminAuth] No se encontró el admin o la contraseña no coincide');
        return { success: false, error: 'Credenciales inválidas' };
      }

      const session = {
        admin: data as Admin,
        token: 'admin-token'
      };

      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
      setAdmin(data as Admin);
      return { success: true };
    } catch (err: any) {
      console.error('[AdminAuth] Excepción:', err);
      return { success: false, error: 'Error inesperado al iniciar sesión' };
    }
  };

  const logout = () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setAdmin(null);
  };

  return React.createElement(
    AdminAuthContext.Provider,
    {
      value: {
        admin,
        isLoading,
        login,
        logout,
        isAuthenticated: !!admin
      }
    },
    children
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}