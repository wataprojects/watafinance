import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PerformanceIndicatorProps {
  rendimiento: 'alto' | 'medio' | 'bajo';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const config = {
  alto: {
    label: 'Alto',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/30',
    icon: TrendingUp,
  },
  medio: {
    label: 'Medio',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/30',
    icon: Minus,
  },
  bajo: {
    label: 'Bajo',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/20',
    borderColor: 'border-rose-500/30',
    icon: TrendingDown,
  },
};

const sizeConfig = {
  sm: {
    badge: 'px-2 py-0.5 text-[10px]',
    icon: 'w-3 h-3',
  },
  md: {
    badge: 'px-2.5 py-1 text-xs',
    icon: 'w-3.5 h-3.5',
  },
  lg: {
    badge: 'px-3 py-1.5 text-sm',
    icon: 'w-4 h-4',
  },
};

export const PerformanceIndicator = ({ 
  rendimiento, 
  size = 'md',
  showLabel = true 
}: PerformanceIndicatorProps) => {
  const { label, color, bgColor, borderColor, icon: Icon } = config[rendimiento];
  const { badge, icon } = sizeConfig[size];

  return (
    <span 
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium border
        ${bgColor} ${color} ${borderColor} ${badge}
      `}
    >
      <Icon className={icon} />
      {showLabel && <span>{label}</span>}
    </span>
  );
};

export default PerformanceIndicator;