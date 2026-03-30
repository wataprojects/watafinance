import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  console.log('[process-loans-monthly] Starting...')

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No authorization header' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      })
    }

    // Verify the user's token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      console.error('[process-loans-monthly] Auth error:', authError)
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid token' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      })
    }

    console.log('[process-loans-monthly] Processing for user:', user.id)

    // Get current date info
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    const currentDay = now.getDate()
    
    // Format dates for the current month
    const currentMonthStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`
    const lastDayOfMonth = new Date(currentYear, currentMonth, 0).getDate()

    console.log('[process-loans-monthly] Current date:', currentYear, currentMonth, currentDay)

    // ============================================
    // PROCESS ACTIVE LOANS
    // ============================================
    console.log('[process-loans-monthly] Processing active loans...')

    // Get all active loans for this user
    const { data: activeLoans, error: loansError } = await supabaseAdmin
      .from('loans')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')

    if (loansError) {
      console.error('[process-loans-monthly] Error fetching loans:', loansError)
      return new Response(JSON.stringify({ 
        success: false, 
        error: loansError.message 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      })
    }

    let loansProcessed = 0
    let loansCompleted = 0
    let totalReduced = 0

    if (activeLoans && activeLoans.length > 0) {
      for (const loan of activeLoans) {
        const monthlyPayment = parseFloat(loan.monthly_payment || 0)
        let currentAmount = parseFloat(loan.current_amount)
        
        console.log('[process-loans-monthly] Processing loan:', loan.borrower_name, 'current:', currentAmount, 'payment:', monthlyPayment)

        // Check if this loan has a collection day and if we've passed it
        // If collection_day is set and current day is before or on that day, don't process yet
        if (loan.collection_day && currentDay < loan.collection_day) {
          console.log('[process-loans-monthly] Skipping - collection day not reached:', loan.collection_day)
          continue
        }

        // Check if we've already processed this month
        // We store last_processed_at to track this
        if (loan.updated_at) {
          const lastUpdated = new Date(loan.updated_at)
          const lastUpdatedMonth = `${lastUpdated.getFullYear()}-${(lastUpdated.getMonth() + 1).toString().padStart(2, '0')}`
          
          if (lastUpdatedMonth === currentMonthStr) {
            console.log('[process-loans-monthly] Already processed this month for:', loan.borrower_name)
            continue
          }
        }

        // Check if the loan has an end_date and if it has passed
        if (loan.end_date) {
          const endDate = new Date(loan.end_date)
          const endDateStr = `${endDate.getFullYear()}-${(endDate.getMonth() + 1).toString().padStart(2, '0')}`
          
          if (endDateStr < currentMonthStr) {
            console.log('[process-loans-monthly] Loan has ended, marking as paid:', loan.borrower_name)
            
            await supabaseAdmin
              .from('loans')
              .update({ 
                status: 'paid',
                current_amount: 0,
                updated_at: now.toISOString()
              })
              .eq('id', loan.id)
            
            loansCompleted++
            loansProcessed++
            continue
          }
        }

        // Reduce the current amount by the monthly payment
        const newAmount = Math.max(0, currentAmount - monthlyPayment)
        totalReduced += (currentAmount - newAmount)

        // Check if loan is fully paid
        const newStatus = newAmount <= 0 ? 'paid' : 'active'

        // Update the loan
        const { error: updateError } = await supabaseAdmin
          .from('loans')
          .update({ 
            current_amount: newAmount,
            status: newStatus,
            paid_at: newStatus === 'paid' ? now.toISOString() : null,
            updated_at: now.toISOString()
          })
          .eq('id', loan.id)

        if (updateError) {
          console.error('[process-loans-monthly] Error updating loan:', updateError)
        } else {
          console.log('[process-loans-monthly] Updated loan:', loan.borrower_name, 'from', currentAmount, 'to', newAmount)
          loansProcessed++
          
          if (newStatus === 'paid') {
            loansCompleted++
          }
        }
      }
    }

    console.log('[process-loans-monthly] Loans processed:', loansProcessed, 'completed:', loansCompleted, 'total reduced:', totalReduced)

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Loans processed successfully',
      loansProcessed,
      loansCompleted,
      totalReduced,
      processedMonth: currentMonthStr
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('[process-loans-monthly] Error:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})