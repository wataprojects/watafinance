import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ConfirmDebtRequest {
  debtId: string
  action: 'accept' | 'reject' | 'negotiate' | 'mark_paid'
  message?: string
  negotiateAmount?: number
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  console.log('[confirm-debt] Starting...')

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
      console.error('[confirm-debt] Auth error:', authError)
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid token' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      })
    }

    const body: ConfirmDebtRequest = await req.json()
    const { debtId, action, message, negotiateAmount } = body

    if (!debtId || !action) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required fields' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      })
    }

    console.log('[confirm-debt] Processing action:', action, 'for debt:', debtId)

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

    // Determine new status and timestamps
    let newStatus = debt.status
    let updateData: any = {}
    let eventType = ''
    let eventData: any = { action }

    const now = new Date().toISOString()

    switch (action) {
      case 'accept':
        newStatus = 'accepted'
        updateData = {
          status: 'accepted',
          accepted_at: now
        }
        eventType = 'accepted'
        eventData.message = message || 'Deuda aceptada'
        break

      case 'reject':
        newStatus = 'rejected'
        updateData = {
          status: 'rejected',
          rejected_at: now
        }
        eventType = 'rejected'
        eventData.message = message || 'Deuda rechazada'
        break

      case 'negotiate':
        newStatus = 'negotiating'
        updateData = {
          status: 'negotiating'
        }
        eventType = 'negotiating'
        eventData.message = message || 'Propuesta de negociación'
        if (negotiateAmount) {
          eventData.proposed_amount = negotiateAmount
          updateData.current_amount = negotiateAmount
        }
        break

      case 'mark_paid':
        newStatus = 'paid'
        updateData = {
          status: 'paid',
          paid_at: now,
          paid_amount: debt.current_amount || debt.initial_amount
        }
        eventType = 'paid'
        eventData.message = 'Deuda marcada como pagada'
        break

      default:
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Invalid action' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
    }

    // Update debt status
    const { error: updateError } = await supabaseAdmin
      .from('debts')
      .update(updateData)
      .eq('id', debtId)

    if (updateError) {
      console.error('[confirm-debt] Update error:', updateError)
      return new Response(JSON.stringify({ 
        success: false, 
        error: updateError.message 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      })
    }

    // Create event in timeline
    await supabaseAdmin.from('debt_events').insert({
      debt_id: debtId,
      user_id: user.id,
      event_type: eventType,
      event_data: eventData
    })

    console.log('[confirm-debt] Debt updated successfully')

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Debt ${action} successfully`,
      newStatus: newStatus
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('[confirm-debt] Error:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})