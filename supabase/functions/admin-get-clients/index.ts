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

  console.log('[admin-get-clients] Iniciando petición...')

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Cliente con privilegios de admin (solo en el servidor)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Obtener todos los usuarios de Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    if (authError) {
      console.error('[admin-get-clients] Error Auth:', authError)
      throw authError
    }

    // 2. Obtener todos los perfiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*')
    
    if (profilesError) {
      console.error('[admin-get-clients] Error Profiles:', profilesError)
    }

    // 3. Combinar datos
    const combined = (authData.users || []).map(user => {
      const profile = (profiles || []).find(p => p.id === user.id)
      return {
        id: user.id,
        email: user.email,
        first_name: profile?.first_name || null,
        last_name: profile?.last_name || null,
        created_at: user.created_at
      }
    })

    console.log(`[admin-get-clients] Éxito: ${combined.length} usuarios encontrados`)

    return new Response(JSON.stringify(combined), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('[admin-get-clients] Error crítico:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})