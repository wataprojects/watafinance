import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserFinancialData {
  totalExpenses: number;
  totalIncome: number;
  totalDebt: number;
  savingsRatio: number;
  expenseCategories: Record<string, number>;
  subscriptions: number;
  investments: number;
  patrimony: number;
}

function calculateRiskLevel(data: UserFinancialData): 'conservative' | 'moderate' | 'aggressive' {
  const debtRatio = data.totalDebt / data.totalIncome;
  const savingsRatio = data.savingsRatio;
  
  if (debtRatio > 0.5 || savingsRatio < 5) return 'conservative';
  if (debtRatio < 0.2 && savingsRatio > 20) return 'aggressive';
  return 'moderate';
}

function calculateUserType(data: UserFinancialData): 'saver' | 'spender' | 'debtor' | 'investor' | 'balanced' {
  const debtRatio = data.totalDebt / data.totalIncome;
  const savingsRatio = data.savingsRatio;
  
  if (debtRatio > 0.4) return 'debtor';
  if (savingsRatio > 25 && data.investments > 0) return 'investor';
  if (savingsRatio > 20) return 'saver';
  if (savingsRatio < 10) return 'spender';
  return 'balanced';
}

function calculateFinancialHealth(data: UserFinancialData): number {
  let score = 50;
  
  // Savings ratio contribution (max 20 points)
  score += Math.min(20, data.savingsRatio);
  
  // Debt ratio contribution (max -20 points)
  const debtRatio = data.totalDebt / data.totalIncome;
  if (debtRatio > 0.5) score -= 20;
  else if (debtRatio > 0.3) score -= 10;
  else if (debtRatio > 0.1) score -= 5;
  
  // Investments contribution (max 15 points)
  if (data.investments > data.totalIncome * 0.5) score += 15;
  else if (data.investments > data.totalIncome * 0.2) score += 10;
  else if (data.investments > 0) score += 5;
  
  // Expense management (max 15 points)
  const expenseRatio = data.totalExpenses / data.totalIncome;
  if (expenseRatio < 0.7) score += 15;
  else if (expenseRatio < 0.85) score += 10;
  else if (expenseRatio < 1) score += 5;
  
  return Math.max(0, Math.min(100, score));
}

function calculateSavingsPotential(data: UserFinancialData): number {
  let potential = 0;
  
  // Mobile expense optimization
  const mobileExpense = data.expenseCategories['móvil'] || data.expenseCategories['teléfono'] || 0;
  if (mobileExpense > 30) potential += (mobileExpense - 30) * 12;
  
  // Insurance optimization
  const insuranceExpense = data.expenseCategories['seguros'] || 0;
  if (insuranceExpense > 50) potential += (insuranceExpense - 50) * 12;
  
  // Subscriptions optimization
  if (data.subscriptions > 0) potential += data.subscriptions * 0.2 * 12;
  
  // General savings potential based on low savings ratio
  if (data.savingsRatio < 10) {
    potential += data.totalIncome * 0.1 * 12;
  }
  
  return Math.round(potential * 100) / 100;
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

    // Fetch user's financial data
    const [expenses, incomes, debts, investments, patrimony] = await Promise.all([
      supabase.from('expenses').select('amount, category').eq('user_id', user.id),
      supabase.from('incomes').select('amount').eq('user_id', user.id),
      supabase.from('debts').select('amount, interest_rate').eq('user_id', user.id),
      supabase.from('investments').select('current_value').eq('user_id', user.id),
      supabase.from('patrimony').select('value, category').eq('user_id', user.id)
    ]);

    // Calculate totals
    const totalExpenses = expenses.data?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
    const totalIncome = incomes.data?.reduce((sum, i) => sum + (i.amount || 0), 0) || 0;
    const totalDebt = debts.data?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;
    const totalInvestments = investments.data?.reduce((sum, i) => sum + (i.current_value || 0), 0) || 0;
    const totalPatrimony = patrimony.data?.reduce((sum, p) => sum + (p.value || 0), 0) || 0;
    
    // Calculate expense categories
    const expenseCategories: Record<string, number> = {};
    expenses.data?.forEach(e => {
      const cat = e.category?.toLowerCase() || 'other';
      expenseCategories[cat] = (expenseCategories[cat] || 0) + (e.amount || 0);
    });

    // Calculate savings ratio
    const savingsRatio = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    // Detect subscriptions (recurring expenses)
    const subscriptionCategories = ['suscripción', 'streaming', 'gym', 'membership'];
    const subscriptions = Object.entries(expenseCategories)
      .filter(([cat]) => subscriptionCategories.some(s => cat.includes(s)))
      .reduce((sum, [, amount]) => sum + amount, 0);

    const financialData: UserFinancialData = {
      totalExpenses,
      totalIncome,
      totalDebt,
      savingsRatio,
      expenseCategories,
      subscriptions,
      investments: totalInvestments,
      patrimony: totalPatrimony
    };

    const riskLevel = calculateRiskLevel(financialData);
    const userType = calculateUserType(financialData);
    const financialHealth = calculateFinancialHealth(financialData);
    const savingsPotential = calculateSavingsPotential(financialData);

    // Save or update profile
    const { data: existingProfile } = await supabase
      .from('user_financial_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const profileData = {
      user_id: user.id,
      risk_level: riskLevel,
      user_type: userType,
      financial_health: financialHealth,
      savings_potential: savingsPotential,
      total_expenses: totalExpenses,
      total_income: totalIncome,
      total_debt: totalDebt,
      savings_ratio: savingsRatio,
      profile_data: financialData,
      calculated_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (existingProfile) {
      await supabase
        .from('user_financial_profiles')
        .update(profileData)
        .eq('user_id', user.id);
    } else {
      await supabase
        .from('user_financial_profiles')
        .insert(profileData);
    }

    console.log('[calculate-user-profile] Profile calculated for user:', user.id);

    return new Response(JSON.stringify({
      riskLevel,
      userType,
      financialHealth,
      savingsPotential,
      totalExpenses,
      totalIncome,
      totalDebt,
      savingsRatio,
      expenseCategories
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[calculate-user-profile] Error:', error);
    return new Response('Internal Server Error', { status: 500, headers: corsHeaders });
  }
});