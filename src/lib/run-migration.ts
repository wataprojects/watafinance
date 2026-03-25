// This script should be run once to add the is_trimmed column to the expenses table
// Run with: npx tsx src/lib/run-migration.ts

import { supabase } from '@/integrations/supabase/client'

async function runMigration() {
  console.log('[migration] Starting migration to add is_trimmed column...')
  
  try {
    // Check if the column already exists by trying to select it
    const { data, error } = await supabase
      .from('expenses')
      .select('is_trimmed')
      .limit(1)
    
    if (!error) {
      console.log('[migration] Column is_trimmed already exists')
      return
    }
    
    // If we get here, the column doesn't exist
    // We need to use the service role key to alter the table
    // This requires admin access which we can't do from the client
    console.log('[migration] Column does not exist. Please run this SQL in Supabase:')
    console.log('ALTER TABLE expenses ADD COLUMN IF NOT EXISTS is_trimmed BOOLEAN DEFAULT false;')
    
  } catch (error) {
    console.error('[migration] Migration failed:', error)
  }
}

runMigration()