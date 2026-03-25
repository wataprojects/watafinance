import { supabase } from '@/integrations/supabase/client'

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
    
    if (!error) {
      // Column exists
      return true
    }
    
    // Column doesn't exist - in a real app, you'd need to run this SQL via admin API
    // For now, we'll just return false and the UI will work without trimming
    console.warn('[supabase] is_trimmed column not found. Please run: ALTER TABLE expenses ADD COLUMN IF NOT EXISTS is_trimmed BOOLEAN DEFAULT false;')
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
      return { success: false, error: error.message }
    }
    
    return { success: true }
    
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}