import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LoanUpdate {
  id: string;
  name: string;
  previousAmount: number;
  monthlyPayment: number;
  newAmount: number;
  status: string;
}

serve(async (req) => {
  console.log("[process-monthly-loans] Starting monthly loan processing");

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get all active loans
    const { data: loans, error: fetchError } = await supabase
      .from('loans')
      .select('id, user_id, borrower_name, current_amount, monthly_payment, status, initial_amount')
      .eq('status', 'active')

    if (fetchError) {
      console.error("[process-monthly-loans] Error fetching loans:", fetchError);
      return new Response(JSON.stringify({ error: 'Error fetching loans' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`[process-monthly-loans] Found ${loans?.length || 0} active loans to process`);

    const updates: LoanUpdate[] = [];

    if (loans && loans.length > 0) {
      for (const loan of loans) {
        const currentAmount = parseFloat(loan.current_amount);
        const monthlyPayment = parseFloat(loan.monthly_payment);
        const newAmount = Math.max(0, currentAmount - monthlyPayment);
        
        // Determine new status
        let newStatus = 'active';
        if (newAmount <= 0) {
          newStatus = 'paid';
        }

        // Update the loan
        const { error: updateError } = await supabase
          .from('loans')
          .update({ 
            current_amount: newAmount,
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', loan.id)

        if (updateError) {
          console.error(`[process-monthly-loans] Error updating loan ${loan.id}:`, updateError);
        } else {
          console.log(`[process-monthly-loans] Updated loan ${loan.borrower_name}: ${currentAmount} - ${monthlyPayment} = ${newAmount}`);
          
          updates.push({
            id: loan.id,
            name: loan.borrower_name,
            previousAmount: currentAmount,
            monthlyPayment: monthlyPayment,
            newAmount: newAmount,
            status: newStatus
          });

          // If loan is now paid, record it
          if (newStatus === 'paid') {
            await supabase
              .from('loans')
              .update({ paid_at: new Date().toISOString() })
              .eq('id', loan.id);
          }
        }
      }
    }

    const summary = {
      processed_at: new Date().toISOString(),
      total_loans_processed: updates.length,
      loans_updated: updates
    };

    console.log("[process-monthly-loans] Processing complete:", summary);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("[process-monthly-loans] Unexpected error:", error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});