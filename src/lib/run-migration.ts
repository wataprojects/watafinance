/**
 * Migration Script: Add is_trimmed column to expenses table
 * 
 * This script requires manual execution in Supabase because DDL statements
 * (like ALTER TABLE) cannot be executed through the regular Supabase client.
 * 
 * To run this migration:
 * 1. Go to your Supabase project dashboard
 * 2. Navigate to SQL Editor
 * 3. Run the SQL command below
 */

import { supabase } from '@/integrations/supabase/client'

/**
 * Check if the is_trimmed column exists in the expenses table
 */
export async function checkIsTrimmedColumn(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('expenses')
      .select('is_trimmed')
      .limit(1)
      .maybeSingle()
    
    // If no error, column exists
    if (!error) {
      console.log('[migration] Column is_trimmed already exists')
      return true
    }
    
    console.log('[migration] Column is_trimmed does not exist')
    return false
    
  } catch (err) {
    console.error('[migration] Error checking column:', err)
    return false
  }
}

/**
 * Run the migration to add is_trimmed column
 * NOTE: This function checks if the column exists but cannot create it.
 * You must run the SQL manually in Supabase SQL Editor.
 */
export async function runMigration(): Promise<{ success: boolean; message: string }> {
  console.log('[migration] Starting migration...')
  
  // First check if column exists
  const columnExists = await checkIsTrimmedColumn()
  
  if (columnExists) {
    return {
      success: true,
      message: 'Column is_trimmed already exists in the expenses table'
    }
  }
  
  // Column doesn't exist - return instructions for manual migration
  console.log('[migration] Column needs to be added manually')
  
  return {
    success: false,
    message: `Please run this SQL in Supabase SQL Editor:

ALTER TABLE expenses ADD COLUMN IF NOT EXISTS is_trimmed BOOLEAN DEFAULT false;

Then refresh the page to verify the migration was successful.`
  }
}

/**
 * SQL Command to run in Supabase:
 * 
 * ALTER TABLE expenses ADD COLUMN IF NOT EXISTS is_trimmed BOOLEAN DEFAULT false;
 * 
 * After running this, the "Recortar" (trim) functionality in ExpensesPage will work.
 */

// Export the SQL for reference
export const MIGRATION_SQL = `
-- Add is_trimmed column to expenses table
-- This column is used to mark subscriptions that have been "trimmed" (cancelled)

ALTER TABLE expenses ADD COLUMN IF NOT EXISTS is_trimmed BOOLEAN DEFAULT false;

-- Optional: Add an index for better query performance
CREATE INDEX IF NOT EXISTS idx_expenses_is_trimmed ON expenses(is_trimmed) WHERE is_trimmed = true;
`