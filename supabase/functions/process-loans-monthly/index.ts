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

  console.log('[process-loans-monthly] Iniciando proceso...')

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: 'No auth header' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid token' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      })
    }

    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    const currentDay = now.getDate()
    const currentMonthStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`
    const todayStr = now.toISOString().split('T')[0]

    const { data: activeLoans, error: loansError } = await supabaseAdmin
      .from('loans')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')

    if (loansError) throw loansError

    let loansProcessed = 0
    let totalReduced = 0

    if (activeLoans) {
      for (const loan of activeLoans) {
        const monthlyPayment = parseFloat(loan.monthly_payment || 0)
        const currentAmount = parseFloat(loan.current_amount)
        const collectionDay = loan.collection_day || 1

        // 1. Solo procesar si ya hemos llegado al día de cobro
        if (currentDay < collectionDay) continue

        // 2. Lógica robusta: Solo saltar si ya se actualizó HOY
        // Esto evita que ediciones manuales en días anteriores bloqueen el cobro automático
        if (loan.updated_at) {
          const lastUpdatedDate = loan.updated_at.split('T')[0]
          if (lastUpdatedDate === todayStr) {
            console.log(`[process-loans-monthly] Ya procesado hoy: ${loan.borrower_name}`)
            continue
          }
        }

        const newAmount = Math.max(0, currentAmount - monthlyPayment)
        const newStatus = newAmount <= 0 ? 'paid' : 'active'

        const { error: updateError } = await supabaseAdmin
          .from('loans')
          .update({ 
            current_amount: newAmount,
            status: newStatus,
            paid_at: newStatus === 'paid' ? now.toISOString() : null,
            updated_at: now.toISOString() // Marcamos que se procesó hoy
          })
          .eq('id', loan.id)

        if (!updateError) {
          loansProcessed++
          totalReduced += (currentAmount - newAmount)
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      loansProcessed,
      totalReduced,
      processedMonth: currentMonthStr
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('[process-loans-monthly] Error:', error)
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})