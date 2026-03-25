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

  console.log('[run-expenses-migration] Starting migration...')

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // First, check if the column already exists by trying to select it
    console.log('[run-expenses-migration] Checking if is_trimmed column exists...')
    
    const { data: checkData, error: checkError } = await supabaseAdmin
      .from('expenses')
      .select('is_trimmed')
      .limit(1)
      .maybeSingle()

    if (!checkError) {
      console.log('[run-expenses-migration] Column is_trimmed already exists')
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Column is_trimmed already exists',
        alreadyExists: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('[run-expenses-migration] Column does not exist, adding it...')

    // Use rpc to execute the ALTER TABLE statement
    // Note: This requires the pg_execute_server_program role or direct superuser access
    // Since we're using service role, this should work
    const { data: alterData, error: alterError } = await supabaseAdmin.rpc('pg_catalog', {
      statement: 'ALTER TABLE expenses ADD COLUMN IF NOT EXISTS is_trimmed BOOLEAN DEFAULT false'
    })

    if (alterError) {
      console.error('[run-expenses-migration] Error adding column via rpc:', alterError)
      
      // Try alternative approach - use raw query through a different method
      // Since standard Supabase client doesn't support DDL directly,
      // we'll return an error with instructions
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Could not add column automatically. Please run the SQL manually.',
        sql: 'ALTER TABLE expenses ADD COLUMN IF NOT EXISTS is_trimmed BOOLEAN DEFAULT false;',
        error: alterError.message
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      })
    }

    console.log('[run-expenses-migration] Column added successfully')
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Column is_trimmed added successfully',
      alreadyExists: false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('[run-expenses-migration] Unexpected error:', error)
    
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Migration failed',
      error: error.message,
      sql: 'ALTER TABLE expenses ADD COLUMN IF NOT EXISTS is_trimmed BOOLEAN DEFAULT false;'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})