import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'emerald' | 'blue' | 'purple' | 'orange' | 'red';
}

const colorMap = {
  emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20',
  blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/20',
  purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/20',
  orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/20',
  red: 'from-red-500/20 to-red-600/10 border-red-500/20',
};

const iconColorMap = {
  emerald: 'text-emerald-400',
  blue: 'text-blue-400',
  purple: 'text-purple-400',
  orange: 'text-orange-400',
  red: 'text-red-400',
};

export default function MetricsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'emerald'
}: MetricsCardProps) {
  return (
    <Card className={`bg-gradient-to-br ${colorMap[color]} border p-6`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-500">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 text-xs ${trend.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}% vs mes anterior</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-slate-800/50 ${iconColorMap[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}
