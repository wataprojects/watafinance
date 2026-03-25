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

  console.log('[add-is-trimmed-column] Starting...')

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Check if column exists by trying to select it
    const { error: selectError } = await supabaseAdmin
      .from('expenses')
      .select('is_trimmed')
      .limit(1)
      .maybeSingle()

    if (!selectError) {
      console.log('[add-is-trimmed-column] Column already exists')
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Column is_trimmed already exists in expenses table',
        alreadyExists: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Column doesn't exist - we need to add it
    // Unfortunately, Supabase edge functions with service role key
    // cannot execute DDL statements directly through the JS client
    // The user must run this SQL manually in Supabase SQL Editor:
    const requiredSQL = 'ALTER TABLE expenses ADD COLUMN IF NOT EXISTS is_trimmed BOOLEAN DEFAULT false;'

    console.log('[add-is-trimmed-column] Column does not exist. Manual migration required.')

    return new Response(JSON.stringify({ 
      success: false,
      alreadyExists: false,
      message: 'The is_trimmed column does not exist. Please run this SQL in your Supabase SQL Editor:',
      sql: requiredSQL,
      instructions: [
        '1. Go to your Supabase project dashboard',
        '2. Navigate to SQL Editor',
        '3. Copy and paste the SQL command above',
        '4. Click Run',
        '5. Refresh your application'
      ]
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('[add-is-trimmed-column] Error:', error)
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})