import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DebtInviteRequest {
  debtId: string
  creditorEmail: string
  creditorName: string
  amount: number
  description: string
  debtType: 'they_owe' | 'i_owe'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  console.log('[send-debt-invite] Starting...')

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
      console.error('[send-debt-invite] Auth error:', authError)
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid token' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      })
    }

    const body: DebtInviteRequest = await req.json()
    const { debtId, creditorEmail, creditorName, amount, description, debtType } = body

    if (!debtId || !creditorEmail) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required fields' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      })
    }

    console.log('[send-debt-invite] Processing invite for:', creditorEmail)

    // Check if user with this email exists
    const { data: existingUser } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    // Get creator's name
    const { data: creatorProfile } = await supabaseAdmin
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single()

    const creatorName = creatorProfile 
      ? `${creatorProfile.first_name || ''} ${creatorProfile.last_name || ''}`.trim() 
      : 'Alguien'

    // Check if creditor already has an account
    const { data: creditorProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', creditorEmail)
      .single()

    let associatedUserId = creditorProfile?.id || null
    let inviteToken = null

    if (associatedUserId) {
      // User exists - associate the debt
      console.log('[send-debt-invite] Creditor has account, associating...')
      
      await supabaseAdmin
        .from('debts')
        .update({ associated_user_id: associatedUserId })
        .eq('id', debtId)
    } else {
      // Create invite token for new user registration
      inviteToken = crypto.randomUUID()
      console.log('[send-debt-invite] Creating invite for new user')
    }

    // Update debt with creditor email
    await supabaseAdmin
      .from('debts')
      .update({ 
        creditor_email: creditorEmail,
        associated_user_id: associatedUserId
      })
      .eq('id', debtId)

    // Send email via Resend (if available)
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (resendApiKey) {
      const subject = debtType === 'they_owe' 
        ? `${creatorName} te debe dinero - FinPro`
        : `${creatorName} te pide dinero - FinPro`
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #000; color: #fff; padding: 20px;">
          <div style="max-width: 500px; margin: 0 auto; background: #18181b; border-radius: 16px; padding: 32px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="width: 60px; height: 60px; background: #f59e0b; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                <span style="font-size: 28px; font-weight: bold; color: #000;">F</span>
              </div>
              <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 8px 0;">Nueva deuda registrada</h1>
            </div>
            
            <p style="color: #a1a1aa; margin: 0 0 24px 0;">
              ${creatorName} ha registrado una deuda contigo en FinPro.
            </p>
            
            <div style="background: #27272a; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                <span style="color: #a1a1aa;">Tipo:</span>
                <span style="color: ${debtType === 'they_owe' ? '#22c55e' : '#ef4444'}; font-weight: 600;">
                  ${debtType === 'they_owe' ? 'Te deben' : 'Debes'}
                </span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                <span style="color: #a1a1aa;">Cantidad:</span>
                <span style="color: #fff; font-weight: bold; font-size: 20px;">${amount}€</span>
              </div>
              ${description ? `
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #a1a1aa;">Motivo:</span>
                <span style="color: #fff;">${description}</span>
              </div>
              ` : ''}
            </div>
            
            <p style="color: #71717a; font-size: 14px; margin: 0 0 24px 0;">
              ${associatedUserId 
                ? 'La deuda ha sido asociada a tu cuenta. Puedes aceptarla o rechazarla desde la app.' 
                : 'Para confirmar o rechazar esta deuda, crea una cuenta en FinPro.'}
            </p>
            
            <a href="${Deno.env.get('SUPABASE_URL') || 'https://finpro.app'}/register${inviteToken ? `?invite=${inviteToken}&debt=${debtId}` : ''}" 
               style="display: block; background: #f59e0b; color: #000; text-decoration: none; padding: 16px 24px; border-radius: 12px; font-weight: 600; text-align: center;">
              ${associatedUserId ? 'Ver en FinPro' : 'Crear cuenta en FinPro'}
            </a>
            
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #3f3f46; text-align: center;">
              <p style="color: #71717a; font-size: 12px; margin: 0;">
                FinPro - Gestión financiera colaborativa
              </p>
            </div>
          </div>
        </body>
        </html>
      `

      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
          from: 'FinPro <noreply@finpro.app>',
          to: creditorEmail,
          subject: subject,
          html: htmlContent
        })
      })

      if (emailResponse.ok) {
        console.log('[send-debt-invite] Email sent successfully')
      } else {
        const emailError = await emailResponse.text()
        console.error('[send-debt-invite] Email error:', emailError)
      }
    } else {
      console.log('[send-debt-invite] RESEND_API_KEY not configured, skipping email')
    }

    // Create initial event
    await supabaseAdmin.from('debt_events').insert({
      debt_id: debtId,
      user_id: user.id,
      event_type: 'created',
      event_data: {
        creditor_email: creditorEmail,
        creditor_name: creditorName,
        amount: amount,
        description: description,
        invite_sent: true
      }
    })

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Invite sent successfully',
      associatedUserId: associatedUserId,
      inviteToken: inviteToken
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('[send-debt-invite] Error:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})