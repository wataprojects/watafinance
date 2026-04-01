import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabaseAdmin, Admin, AdminSession } from '@/integrations/supabase/admin';

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
        const session: AdminSession = JSON.parse(savedSession);
        setAdmin(session.admin);
      } catch {
        localStorage.removeItem(ADMIN_SESSION_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Limpiamos el email y lo pasamos a minúsculas para evitar errores de escritura
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();

      const { data, error } = await supabaseAdmin
        .from('admins')
        .select('*')
        .eq('email', cleanEmail)
        .eq('password_hash', cleanPassword)
        .single();

      if (error || !data) {
        console.error('Error de login admin:', error);
        return { success: false, error: 'Credenciales inválidas' };
      }

      const session: AdminSession = {
        admin: data as Admin,
        token: 'admin-token'
      };

      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
      setAdmin(data as Admin);
      return { success: true };
    } catch (err) {
      console.error('Excepción en login admin:', err);
      return { success: false, error: 'Error al iniciar sesión' };
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