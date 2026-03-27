import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Fetch all active rules
    const { data: rules } = await supabase
      .from('monetization_rules')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false });

    // Fetch all active offers
    const { data: offers } = await supabase
      .from('affiliate_offers')
      .select('*')
      .eq('is_active', true);

    // Get user profile
    const { data: profile } = await supabase
      .from('user_financial_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const evaluatedRules = rules?.map(rule => {
      const conditionValue = typeof rule.condition_value === 'string' 
        ? JSON.parse(rule.condition_value) 
        : rule.condition_value;

      const offer = offers?.find(o => o.id === rule.action_offer_id);

      return {
        id: rule.id,
        name: rule.name,
        description: rule.description,
        condition_type: rule.condition_type,
        condition_value: conditionValue,
        priority: rule.priority,
        offer: offer || null,
        is_applicable: false,
        reason: ''
      };
    }) || [];

    console.log('[evaluate-rules] Evaluated', evaluatedRules.length, 'rules for user:', user.id);

    return new Response(JSON.stringify({
      rules: evaluatedRules,
      profile: profile ? {
        riskLevel: profile.risk_level,
        userType: profile.user_type,
        financialHealth: profile.financial_health,
        savingsPotential: profile.savings_potential
      } : null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[evaluate-rules] Error:', error);
    return new Response('Internal Server Error', { status: 500, headers: corsHeaders });
  }
});