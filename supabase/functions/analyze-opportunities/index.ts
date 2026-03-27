import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConditionValue {
  category?: string;
  min_amount?: number;
  min_debt?: number;
  risk_level?: string;
  min_savings_ratio?: number;
  min_ratio?: number;
  min_income?: number;
  max_growth_rate?: number;
  user_type?: string;
}

interface Rule {
  id: string;
  name: string;
  condition_type: string;
  condition_value: ConditionValue;
  action_offer_id: string;
  priority: number;
}

interface Offer {
  id: string;
  title: string;
  description: string;
  category: string;
  affiliate_link: string;
  expected_commission: number;
}

function evaluateCondition(
  conditionType: string,
  conditionValue: ConditionValue,
  profile: any,
  expenses: any[],
  debts: any[],
  investments: any[]
): boolean {
  const expenseCategories: Record<string, number> = {};
  expenses.forEach(e => {
    const cat = e.category?.toLowerCase() || 'other';
    expenseCategories[cat] = (expenseCategories[cat] || 0) + (e.amount || 0);
  });

  const totalDebt = debts.reduce((sum, d) => sum + (d.amount || 0), 0);
  const totalIncome = profile.total_income || 0;
  const savingsRatio = profile.savings_ratio || 0;
  const hasInvestments = investments.length > 0;

  switch (conditionType) {
    case 'expense_category': {
      const category = conditionValue.category?.toLowerCase();
      const minAmount = conditionValue.min_amount || 0;
      const categoryExpense = expenseCategories[category || ''] || 0;
      return categoryExpense > minAmount;
    }
    case 'debt_level': {
      const minDebt = conditionValue.min_debt || 0;
      return totalDebt > minDebt;
    }
    case 'user_profile': {
      const riskLevel = conditionValue.risk_level;
      const minSavingsRatio = conditionValue.min_savings_ratio || 0;
      return profile.risk_level === riskLevel && savingsRatio > minSavingsRatio;
    }
    case 'savings_ratio': {
      const minRatio = conditionValue.min_ratio || 0;
      return savingsRatio < minRatio;
    }
    case 'income_property': {
      const minIncome = conditionValue.min_income || 0;
      const hasRent = expenses.some(e => 
        e.category?.toLowerCase().includes('alquiler') || 
        e.category?.toLowerCase().includes('rent')
      );
      return hasRent && totalIncome > minIncome;
    }
    case 'no_investments': {
      const minIncome = conditionValue.min_income || 0;
      return !hasInvestments && totalIncome > minIncome;
    }
    case 'expense_growth': {
      // Simplified growth check
      return false;
    }
    case 'user_type': {
      const userType = conditionValue.user_type;
      return profile.user_type === userType;
    }
    default:
      return false;
  }
}

function getOfferTitle(category: string, conditionType: string): string {
  const titles: Record<string, string> = {
    'telecom': 'Podrías ahorrar en tu móvil',
    'insurance': 'Compara y ahorra en seguros',
    'banking': 'Optimiza tus productos bancarios',
    'investments': 'Explora opciones de inversión',
    'utilities': 'Reduce tus facturas de servicios',
    'debt_level': 'Consolida tus deudas',
    'savings_ratio': 'Mejora tu capacidad de ahorro',
    'income_property': '考虑 una hipoteca',
    'no_investments': 'Empieza a invertir',
    'user_type': 'Mejora tu salud financiera'
  };
  return titles[category] || 'Oportunidad detectada';
}

function getOfferDescription(category: string, potentialSavings: number): string {
  const descriptions: Record<string, string> = {
    'telecom': `Podrías ahorrar hasta ${potentialSavings}€ al año cambiando de operador`,
    'insurance': `Compara seguros y ahorra hasta ${potentialSavings}€ anuales`,
    'banking': `Explora opciones mejores para tus ahorros`,
    'investments': `Descubre cómo hacer crecer tu dinero de forma segura`,
    'utilities': `Podrías reducir tus facturas mensuales`,
    'debt_level': `Consolida tus deudas y paga menos intereses`,
    'savings_ratio': `Pequeños cambios pueden significar grandes ahorros`,
    'income_property': `Consigue las mejores condiciones para tu hipoteca`,
    'no_investments': `Empieza a invertir con las mejores plataformas`,
    'user_type': `Te ayudamos a mejorar tu situación financiera`
  };
  return descriptions[category] || `潜在节省 €${potentialSavings}/年`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401, headers: corsHeaders });
  }

  const token = authHeader.replace('Bearer ', '');
  
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response('Invalid token', { status: 401, headers: corsHeaders });
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from('user_financial_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return new Response(JSON.stringify({ 
        error: 'Profile not found. Please calculate profile first.',
        opportunities: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fetch financial data
    const [expenses, debts, investments, offers, rules] = await Promise.all([
      supabase.from('expenses').select('amount, category').eq('user_id', user.id),
      supabase.from('debts').select('amount').eq('user_id', user.id),
      supabase.from('investments').select('id').eq('user_id', user.id),
      supabase.from('affiliate_offers').select('*').eq('is_active', true),
      supabase.from('monetization_rules').select('*').eq('is_active', true).order('priority', { ascending: false })
    ]);

    const opportunities: any[] = [];
    const evaluatedRules = rules.data || [];

    for (const rule of evaluatedRules as Rule[]) {
      const conditionValue = typeof rule.condition_value === 'string' 
        ? JSON.parse(rule.condition_value) 
        : rule.condition_value;

      const matches = evaluateCondition(
        rule.condition_type,
        conditionValue,
        profile,
        expenses.data || [],
        debts.data || [],
        investments.data || []
      );

      if (matches) {
        const offer = (offers.data as Offer[]).find(o => o.id === rule.action_offer_id);
        
        if (offer) {
          const potentialSavings = profile.savings_potential || 0;
          
          opportunities.push({
            rule_id: rule.id,
            offer_id: offer.id,
            title: offer.title,
            description: offer.description,
            category: offer.category,
            affiliate_link: offer.affiliate_link,
            expected_commission: offer.expected_commission,
            potential_savings: potentialSavings
          });
        }
      }
    }

    // Save detected opportunities
    for (const opp of opportunities) {
      const { data: existing } = await supabase
        .from('detected_opportunities')
        .select('id')
        .eq('user_id', user.id)
        .eq('offer_id', opp.offer_id)
        .eq('rule_id', opp.rule_id)
        .single();

      if (!existing) {
        await supabase
          .from('detected_opportunities')
          .insert({
            user_id: user.id,
            offer_id: opp.offer_id,
            rule_id: opp.rule_id,
            title: opp.title,
            description: opp.description,
            category: opp.category,
            potential_savings: opp.potential_savings
          });
      }
    }

    console.log('[analyze-opportunities] Found', opportunities.length, 'opportunities for user:', user.id);

    return new Response(JSON.stringify({
      opportunities,
      profile: {
        riskLevel: profile.risk_level,
        userType: profile.user_type,
        financialHealth: profile.financial_health,
        savingsPotential: profile.savings_potential
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[analyze-opportunities] Error:', error);
    return new Response('Internal Server Error', { status: 500, headers: corsHeaders });
  }
});