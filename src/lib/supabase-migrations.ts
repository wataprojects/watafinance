import { supabase } from '@/integrations/supabase/client'

/**
 * Migration: Add is_trimmed column to expenses table
 * 
 * SQL Command (run in Supabase SQL Editor):
 * ALTER TABLE expenses ADD COLUMN IF NOT EXISTS is_trimmed BOOLEAN DEFAULT false;
 */

export const MIGRATION_SQL = `
-- Add is_trimmed column to expenses table
-- This column is used to mark subscriptions that have been "trimmed" (cancelled)

ALTER TABLE expenses ADD COLUMN IF NOT EXISTS is_trimmed BOOLEAN DEFAULT false;
`

/**
 * Check if the is_trimmed column exists in the expenses table
 * and add it if it doesn't exist
 */
export async function ensureIsTrimmedColumn(): Promise<boolean> {
  try {
    // Try to query with is_trimmed column
    const { error } = await supabase
      .from('expenses')
      .select('is_trimmed')
      .limit(1)
      .maybeSingle()
    
    if (!error) {
      // Column exists
      console.log('[supabase] is_trimmed column exists')
      return true
    }
    
    // Column doesn't exist
    console.warn('[supabase] is_trimmed column not found. Please run this SQL in Supabase:')
    console.warn(MIGRATION_SQL)
    return false
    
  } catch (error) {
    console.error('[supabase] Error checking is_trimmed column:', error)
    return false
  }
}

/**
 * Update the is_trimmed status of an expense
 */
export async function updateExpenseTrimStatus(
  expenseId: string, 
  isTrimmed: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('expenses')
      .update({ is_trimmed: isTrimmed })
      .eq('id', expenseId)
    
    if (error) {
      console.error('[supabase] Error updating expense trim status:', error)
      return { success: false, error: error.message }
    }
    
    console.log(`[supabase] Expense ${expenseId} is_trimmed updated to ${isTrimmed}`)
    return { success: true }
    
  } catch (error: any) {
    console.error('[supabase] Unexpected error updating trim status:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get all trimmed (cancelled) subscriptions
 */
export async function getTrimmedSubscriptions(): Promise<{ 
  success: boolean
  data?: any[]
  error?: string 
}> {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('is_trimmed', true)
      .eq('category', 'subscriptions')
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    return { success: true, data: data || [] }
    
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}