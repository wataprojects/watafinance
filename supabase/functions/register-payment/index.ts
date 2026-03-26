import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RegisterPaymentRequest {
  debtId: string
  amount: number
  note?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  console.log('[register-payment] Starting...')

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
      console.error('[register-payment] Auth error:', authError)
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid token' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      })
    }

    const body: RegisterPaymentRequest = await req.json()
    const { debtId, amount, note } = body

    if (!debtId || !amount || amount <= 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid amount or debt ID' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      })
    }

    console.log('[register-payment] Processing payment for debt:', debtId, 'amount:', amount)

    // Get current debt
    const { data: debt, error: debtError } = await supabaseAdmin
      .from('debts')
      .select('*')
      .eq('id', debtId)
      .single()

    if (debtError || !debt) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Debt not found' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      })
    }

    // Verify user is associated with this debt
    if (debt.user_id !== user.id && debt.associated_user_id !== user.id) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Not authorized to modify this debt' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403
      })
    }

    // Calculate new paid amount
    const currentPaidAmount = parseFloat(debt.paid_amount || '0')
    const newPaidAmount = currentPaidAmount + amount
    const totalAmount = parseFloat(debt.current_amount || debt.initial_amount || '0')
    
    // Determine new status
    let newStatus = debt.status
    if (newPaidAmount >= totalAmount) {
      newStatus = 'paid'
    } else if (newPaidAmount > 0) {
      newStatus = 'partially_paid'
    }

    // Update debt with new paid amount and status
    const { error: updateError } = await supabaseAdmin
      .from('debts')
      .update({
        paid_amount: newPaidAmount,
        status: newStatus,
        paid_at: newStatus === 'paid' ? new Date().toISOString() : null
      })
      .eq('id', debtId)

    if (updateError) {
      console.error('[register-payment] Update error:', updateError)
      return new Response(JSON.stringify({ 
        success: false, 
        error: updateError.message 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      })
    }

    // Create payment record
    const { error: paymentError } = await supabaseAdmin
      .from('debt_payments')
      .insert({
        debt_id: debtId,
        user_id: user.id,
        amount: amount,
        note: note || null
      })

    if (paymentError) {
      console.error('[register-payment] Payment insert error:', paymentError)
    }

    // Create event in timeline
    await supabaseAdmin.from('debt_events').insert({
      debt_id: debtId,
      user_id: user.id,
      event_type: 'payment',
      event_data: {
        amount: amount,
        note: note,
        total_paid: newPaidAmount,
        remaining: totalAmount - newPaidAmount,
        percentage: Math.round((newPaidAmount / totalAmount) * 100)
      }
    })

    console.log('[register-payment] Payment registered successfully')

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Payment registered successfully',
      newPaidAmount: newPaidAmount,
      remainingAmount: totalAmount - newPaidAmount,
      newStatus: newStatus,
      progressPercentage: Math.round((newPaidAmount / totalAmount) * 100)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('[register-payment] Error:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})