"use client";

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseAdmin } from '@/integrations/supabase/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { ShieldCheck, UserPlus, Mail, Lock } from 'lucide-react';

export default function AdminSetup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Insertar el nuevo administrador en la tabla 'admins'
      const { error } = await supabaseAdmin
        .from('admins')
        .insert([
          { 
            email: email.trim().toLowerCase(), 
            password_hash: password.trim(), // En este sistema simple se usa el texto plano como hash
            name: name.trim() 
          }
        ]);

      if (error) {
        if (error.code === '23505') {
          toast.error("Este email ya está registrado como administrador");
        } else {
          toast.error("Error al crear admin: " + error.message);
        }
      } else {
        toast.success("¡Administrador creado con éxito!");
        setTimeout(() => navigate('/admin/login'), 2000);
      }
    } catch (err: any) {
      toast.error("Error de conexión: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-900 border-slate-800">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="text-emerald-500 w-8 h-8" />
          </div>
          <CardTitle className="text-2xl text-white">Configuración Admin</CardTitle>
          <CardDescription className="text-slate-400">
            Crea tu cuenta de administrador para acceder al panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetup} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Nombre completo</label>
              <div className="relative">
                <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700 text-white"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  type="email"
                  placeholder="admin@finpro.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700 text-white"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700 text-white"
                  required
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
              disabled={loading}
            >
              {loading ? "Creando..." : "Crear Administrador"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}