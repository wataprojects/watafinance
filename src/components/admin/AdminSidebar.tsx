import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, TrendingUp } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';

export default function AdminSidebar() {
  const location = useLocation();
  const { logout } = useAdminAuth();

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/clients', label: 'Clientes', icon: Users },
  ];

  return (
    <aside className="w-64 min-h-screen bg-slate-900 border-r border-slate-800 flex flex-col">
      <div className="p-6">
        <Link to="/admin/dashboard" className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500 rounded-xl">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Monyro</h1>
            <p className="text-xs text-slate-400">Administración</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <Button
          onClick={logout}
          variant="ghost"
          className="w-full justify-start gap-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="h-5 w-5" />
          <span>Cerrar Sesión</span>
        </Button>
      </div>
    </aside>
  );
}