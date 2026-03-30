import { supabase } from '@/integrations/supabase/client'
import { SUPABASE_URL } from '@/lib/supabase-env'

/**
 * Process recurring transactions (expenses and incomes) for the current month
 * This should be called when the user logs in or visits the dashboard
 */
export async function processRecurringTransactions(): Promise<{
  success: boolean
  expensesCreated?: number
  expensesSkipped?: number
  incomesCreated?: number
  incomesSkipped?: number
  error?: string
}> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return { success: false, error: 'No session found' }
    }

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/process-recurring-transactions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      }
    )

    const result = await response.json()

    if (result.success) {
      console.log('[automation] Recurring transactions processed:', result)
      return {
        success: true,
        expensesCreated: result.expensesCreated,
        expensesSkipped: result.expensesSkipped,
        incomesCreated: result.incomesCreated,
        incomesSkipped: result.incomesSkipped
      }
    } else {
      console.error('[automation] Error processing recurring transactions:', result.error)
      return { success: false, error: result.error }
    }
  } catch (error: any) {
    console.error('[automation] Exception processing recurring transactions:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Process monthly loan payments (reduce balance)
 * This should be called when the user logs in or visits the dashboard
 */
export async function processLoansMonthly(): Promise<{
  success: boolean
  loansProcessed?: number
  loansCompleted?: number
  totalReduced?: number
  error?: string
}> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return { success: false, error: 'No session found' }
    }

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/process-loans-monthly`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      }
    )

    const result = await response.json()

    if (result.success) {
      console.log('[automation] Loans processed:', result)
      return {
        success: true,
        loansProcessed: result.loansProcessed,
        loansCompleted: result.loansCompleted,
        totalReduced: result.totalReduced
      }
    } else {
      console.error('[automation] Error processing loans:', result.error)
      return { success: false, error: result.error }
    }
  } catch (error: any) {
    console.error('[automation] Exception processing loans:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Run all automation tasks
 * Call this when the user logs in or visits the dashboard
 */
export async function runAllAutomations(): Promise<{
  success: boolean
  recurringTransactions?: {
    expensesCreated: number
    incomesCreated: number
  }
  loans?: {
    loansProcessed: number
    loansCompleted: number
    totalReduced: number
  }
  errors: string[]
}> {
  const errors: string[] = []
  
  // Process recurring transactions
  const recurringResult = await processRecurringTransactions()
  if (!recurringResult.success && recurringResult.error) {
    errors.push(recurringResult.error)
  }

  // Process loans
  const loansResult = await processLoansMonthly()
  if (!loansResult.success && loansResult.error) {
    errors.push(loansResult.error)
  }

  return {
    success: errors.length === 0,
    recurringTransactions: recurringResult.success ? {
      expensesCreated: recurringResult.expensesCreated || 0,
      incomesCreated: recurringResult.incomesCreated || 0
    } : undefined,
    loans: loansResult.success ? {
      loansProcessed: loansResult.loansProcessed || 0,
      loansCompleted: loansResult.loansCompleted || 0,
      totalReduced: loansResult.totalReduced || 0
    } : undefined,
    errors
  }
}