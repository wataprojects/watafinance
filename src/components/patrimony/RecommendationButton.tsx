import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface RecommendationButtonProps {
  label: string;
  icon: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
}

export const RecommendationButton: React.FC<RecommendationButtonProps> = ({
  label,
  icon,
  onClick,
  variant = 'secondary',
  className = '',
}) => {
  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-zinc-800 hover:bg-zinc-700 text-white',
    outline: 'border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white',
  };

  return (
    <Button
      onClick={onClick}
      className={`h-9 px-3 text-sm font-medium ${variantClasses[variant]} ${className}`}
    >
      <span className="mr-1.5">{icon}</span>
      <span>{label}</span>
      <ArrowRight className="w-3 h-3 ml-1.5 opacity-60" />
    </Button>
  );
};
