import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { userId, month, year } = await req.json()

    if (!userId) {
      throw new Error('userId is required')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    console.log(`[admin-get-client-data] Cargando datos para usuario: ${userId}`)

    // Definir rango de fechas si se proporcionan
    let dateQuery = null
    if (month && year) {
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
      const startDate = `${year}-${month}-01`
      const endDate = `${year}-${month}-${lastDay}`
      dateQuery = { start: startDate, end: endDate }
    }

    // Ejecutar todas las consultas en paralelo
    const queries = [
      supabaseAdmin.from('profiles').select('*').eq('id', userId).single(),
      supabaseAdmin.from('incomes').select('*').eq('user_id', userId),
      supabaseAdmin.from('expenses').select('*').eq('user_id', userId),
      supabaseAdmin.from('debts').select('*').eq('user_id', userId),
      supabaseAdmin.from('loans').select('*').eq('user_id', userId),
      supabaseAdmin.from('investments').select('*').eq('user_id', userId),
      supabaseAdmin.from('patrimony').select('*').eq('user_id', userId),
      supabaseAdmin.auth.admin.getUserById(userId)
    ]

    const results = await Promise.all(queries)

    // Filtrar ingresos y gastos por fecha en memoria para mayor flexibilidad
    let incomes = results[1].data || []
    let expenses = results[2].data || []

    if (dateQuery) {
      incomes = incomes.filter(i => i.date >= dateQuery.start && i.date <= dateQuery.end)
      expenses = expenses.filter(e => e.date >= dateQuery.start && e.date <= dateQuery.end)
    }

    const responseData = {
      profile: results[0].data,
      incomes,
      expenses,
      debts: results[3].data || [],
      loans: results[4].data || [],
      investments: results[5].data || [],
      patrimony: results[6].data || [],
      auth: results[7].data?.user
    }

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('[admin-get-client-data] Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})