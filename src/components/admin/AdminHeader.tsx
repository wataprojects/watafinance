import { TrendingUp, Bell } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

export default function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  const { admin } = useAdminAuth();

  return (
    <header className="h-16 bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 px-6 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-emerald-500 rounded-full" />
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-slate-700">
          <div className="text-right">
            <p className="text-sm font-medium text-white">{admin?.name || 'Admin'}</p>
            <p className="text-xs text-slate-400">{admin?.email}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
            <span className="text-sm font-semibold text-white">
              {admin?.name?.charAt(0) || 'A'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
