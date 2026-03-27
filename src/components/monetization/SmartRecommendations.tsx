import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { OpportunityCard } from './OpportunityCard';
import { 
  Lightbulb, 
  RefreshCw, 
  TrendingDown, 
  PiggyBank,
  Wallet,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Opportunity {
  id: string;
  title: string;
  description: string;
  category: string;
  potential_savings: number;
  affiliate_link: string;
}

interface UserProfile {
  riskLevel: string;
  userType: string;
  financialHealth: number;
  savingsPotential: number;
}

export function SmartRecommendations() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeOpportunities = async () => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError('No hay sesión activa');
        setIsAnalyzing(false);
        return;
      }

      // First calculate user profile
      await supabase.functions.invoke('calculate-user-profile', {
        body: { user_id: session.user.id }
      });

      // Then analyze opportunities
      const { data, error: funcError } = await supabase.functions.invoke('analyze-opportunities', {
        body: { user_id: session.user.id }
      });

      if (funcError) {
        console.error('Error analyzing opportunities:', funcError);
        setError('Error al analizar oportunidades');
        return;
      }

      if (data?.opportunities) {
        setOpportunities(data.opportunities);
        setProfile(data.profile);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al analizar oportunidades');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadOpportunities = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const { data } = await supabase
        .from('detected_opportunities')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_dismissed', false)
        .order('detected_at', { ascending: false })
        .limit(5);

      if (data) {
        setOpportunities(data.map(opp => ({
          id: opp.offer_id || opp.id,
          title: opp.title,
          description: opp.description,
          category: opp.category,
          potential_savings: opp.potential_savings,
          affiliate_link: ''
        })));
      }

      // Also load profile
      const { data: profileData } = await supabase
        .from('user_financial_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (profileData) {
        setProfile({
          riskLevel: profileData.risk_level,
          userType: profileData.user_type,
          financialHealth: profileData.financial_health,
          savingsPotential: profileData.savings_potential
        });
      }
    } catch (err) {
      console.error('Error loading opportunities:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      await supabase
        .from('detected_opportunities')
        .update({ is_dismissed: true })
        .eq('id', id);

      setOpportunities(prev => prev.filter(opp => opp.id !== id));
    } catch (err) {
      console.error('Error dismissing opportunity:', err);
    }
  };

  useEffect(() => {
    loadOpportunities();
  }, []);

  const getUserTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      saver: 'Ahorrador',
      spender: 'Gastador',
      debtor: 'Endeudado',
      investor: 'Inversor',
      balanced: 'Equilibrado'
    };
    return labels[type] || type;
  };

  const getRiskLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      conservative: 'Conservador',
      moderate: 'Moderado',
      aggressive: 'Agresivo'
    };
    return labels[level] || level;
  };

  return (
    <Card className="h-full bg-gradient-to-br from-emerald-50/50 to-purple-50/30 border-emerald-100">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            Oportunidades
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={analyzeOpportunities}
            disabled={isAnalyzing}
            className="text-xs h-7 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Analizando...' : 'Actualizar'}
          </Button>
        </div>
        
        {profile && (
          <div className="flex gap-2 mt-2">
            <div className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
              <Wallet className="h-3 w-3" />
              {getUserTypeLabel(profile.userType)}
            </div>
            <div className="flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full">
              <TrendingDown className="h-3 w-3" />
              {getRiskLevelLabel(profile.riskLevel)}
            </div>
            <div className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">
              <PiggyBank className="h-3 w-3" />
              {profile.financialHealth}/100
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex flex-col gap-2 p-3 border rounded-lg">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-6 text-gray-500">
            <Lightbulb className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={analyzeOpportunities}
              className="mt-2"
            >
              Reintentar
            </Button>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="text-center py-6">
            <Lightbulb className="h-8 w-8 mx-auto mb-2 text-amber-500" />
            <p className="text-sm text-gray-600 font-medium">¡Todo controlado!</p>
            <p className="text-xs text-gray-500 mt-1">
              No hemos detectado oportunidades de ahorro en este momento.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {opportunities.map(opp => (
              <OpportunityCard
                key={opp.id}
                id={opp.id}
                title={opp.title}
                description={opp.description}
                category={opp.category}
                potentialSavings={opp.potential_savings}
                affiliateLink={opp.affiliate_link}
                onDismiss={handleDismiss}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}