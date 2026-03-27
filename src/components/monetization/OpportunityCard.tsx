import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  PiggyBank, 
  TrendingDown, 
  TrendingUp, 
  Building2,
  Shield,
  Zap,
  ArrowRight,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface OpportunityCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  potentialSavings: number;
  affiliateLink: string;
  onDismiss?: (id: string) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  telecom: <Zap className="h-5 w-5" />,
  insurance: <Shield className="h-5 w-5" />,
  banking: <Building2 className="h-5 w-5" />,
  investments: <TrendingUp className="h-5 w-5" />,
  utilities: <Zap className="h-5 w-5" />
};

const categoryColors: Record<string, string> = {
  telecom: 'bg-amber-100 text-amber-700 border-amber-200',
  insurance: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  banking: 'bg-blue-100 text-blue-700 border-blue-200',
  investments: 'bg-purple-100 text-purple-700 border-purple-200',
  utilities: 'bg-orange-100 text-orange-700 border-orange-200'
};

export function OpportunityCard({
  id,
  title,
  description,
  category,
  potentialSavings,
  affiliateLink,
  onDismiss
}: OpportunityCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        await supabase.functions.invoke('track-conversion', {
          body: { offer_id: id, conversion_type: 'click' }
        });
      }
      window.open(affiliateLink, '_blank');
    } catch (error) {
      console.error('Error tracking conversion:', error);
      window.open(affiliateLink, '_blank');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDismiss?.(id);
  };

  return (
    <Card className="group relative overflow-hidden border-2 border-transparent hover:border-emerald-200 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-white to-emerald-50/30">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-500"
        onClick={handleDismiss}
      >
        <X className="h-4 w-4" />
      </Button>
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge 
            variant="outline" 
            className={`${categoryColors[category] || 'bg-gray-100 text-gray-700 border-gray-200'}`}
          >
            <span className="mr-1">
              {categoryIcons[category] || <Wallet className="h-4 w-4" />}
            </span>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Badge>
          {potentialSavings > 0 && (
            <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
              <PiggyBank className="h-4 w-4" />
              <span>€{potentialSavings}/año</span>
            </div>
          )}
        </div>
        <CardTitle className="text-base font-semibold text-gray-800 line-clamp-2 mt-2">
          {title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
          {description}
        </p>
        
        <Button 
          onClick={handleClick}
          disabled={isLoading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-300 group-hover:shadow-md"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⏳</span>
              Abriendo...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Ver oferta
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </span>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}