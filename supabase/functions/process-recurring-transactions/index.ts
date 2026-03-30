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

  console.log('[process-recurring-transactions] Starting...')

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No authorization header' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      })
    }

    // Verify the user's token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      console.error('[process-recurring-transactions] Auth error:', authError)
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid token' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      })
    }

    console.log('[process-recurring-transactions] Processing for user:', user.id)

    // Get current date info
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    const lastDayOfMonth = new Date(currentYear, currentMonth, 0).getDate()
    
    // Format dates for the current month
    const startOfMonth = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`
    const endOfMonth = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${lastDayOfMonth.toString().padStart(2, '0')}`

    console.log('[process-recurring-transactions] Processing month:', startOfMonth, 'to', endOfMonth)

    // ============================================
    // PROCESS RECURRING EXPENSES
    // ============================================
    console.log('[process-recurring-transactions] Processing recurring expenses...')

    // Get all recurring expenses for this user
    const { data: recurringExpenses, error: expensesError } = await supabaseAdmin
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_recurring', true)

    if (expensesError) {
      console.error('[process-recurring-transactions] Error fetching expenses:', expensesError)
    }

    let expensesCreated = 0
    let expensesSkipped = 0

    if (recurringExpenses && recurringExpenses.length > 0) {
      for (const expense of recurringExpenses) {
        // Check if this recurring expense already exists for this month
        const { data: existingExpense, error: existingError } = await supabaseAdmin
          .from('expenses')
          .select('id')
          .eq('user_id', user.id)
          .eq('description', expense.description)
          .eq('category', expense.category)
          .eq('amount', expense.amount)
          .eq('is_recurring', true)
          .gte('date', startOfMonth)
          .lte('date', endOfMonth)
          .maybeSingle()

        if (existingError) {
          console.error('[process-recurring-transactions] Error checking existing expense:', existingError)
          continue
        }

        // Skip if already exists or if it's trimmed
        if (existingExpense || expense.is_trimmed) {
          expensesSkipped++
          continue
        }

        // Check if start_date and end_date allow this month
        if (expense.start_date && expense.start_date > endOfMonth) {
          expensesSkipped++
          continue
        }
        if (expense.end_date && expense.end_date < startOfMonth) {
          expensesSkipped++
          continue
        }

        // Create the recurring expense for this month
        // Use the collection_day if available, otherwise use the 1st
        const collectionDay = Math.min(expense.collection_day || 1, lastDayOfMonth)
        const expenseDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${collectionDay.toString().padStart(2, '0')}`

        const { error: insertError } = await supabaseAdmin
          .from('expenses')
          .insert({
            user_id: user.id,
            amount: expense.amount,
            description: expense.description,
            category: expense.category,
            date: expenseDate,
            is_recurring: true,
            investment_id: expense.investment_id,
            patrimony_id: expense.patrimony_id,
            has_scheduled_change: expense.has_scheduled_change,
            scheduled_change_date: expense.scheduled_change_date,
            scheduled_new_amount: expense.scheduled_new_amount,
            scheduled_change_type: expense.scheduled_change_type,
            is_trimmed: expense.is_trimmed || false
          })

        if (insertError) {
          console.error('[process-recurring-transactions] Error creating expense:', insertError)
        } else {
          console.log('[process-recurring-transactions] Created expense:', expense.description)
          expensesCreated++
        }
      }
    }

    console.log('[process-recurring-transactions] Expenses: created=', expensesCreated, 'skipped=', expensesSkipped)

    // ============================================
    // PROCESS RECURRING INCOMES
    // ============================================
    console.log('[process-recurring-transactions] Processing recurring incomes...')

    // Get all recurring incomes for this user
    const { data: recurringIncomes, error: incomesError } = await supabaseAdmin
      .from('incomes')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_recurring', true)

    if (incomesError) {
      console.error('[process-recurring-transactions] Error fetching incomes:', incomesError)
    }

    let incomesCreated = 0
    let incomesSkipped = 0

    if (recurringIncomes && recurringIncomes.length > 0) {
      for (const income of recurringIncomes) {
        // Check if this recurring income already exists for this month
        const { data: existingIncome, error: existingError } = await supabaseAdmin
          .from('incomes')
          .select('id')
          .eq('user_id', user.id)
          .eq('description', income.description)
          .eq('category', income.category)
          .eq('amount', income.amount)
          .eq('is_recurring', true)
          .gte('date', startOfMonth)
          .lte('date', endOfMonth)
          .maybeSingle()

        if (existingError) {
          console.error('[process-recurring-transactions] Error checking existing income:', existingError)
          continue
        }

        // Skip if already exists
        if (existingIncome) {
          incomesSkipped++
          continue
        }

        // Check if start_date and end_date allow this month
        if (income.start_date && income.start_date > endOfMonth) {
          incomesSkipped++
          continue
        }
        if (income.end_date && income.end_date < startOfMonth) {
          incomesSkipped++
          continue
        }

        // Create the recurring income for this month
        // Use the 1st of the month by default
        const incomeDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`

        const { error: insertError } = await supabaseAdmin
          .from('incomes')
          .insert({
            user_id: user.id,
            amount: income.amount,
            description: income.description,
            category: income.category,
            date: incomeDate,
            is_recurring: true,
            is_passive: income.is_passive || false,
            investment_id: income.investment_id,
            patrimony_id: income.patrimony_id
          })

        if (insertError) {
          console.error('[process-recurring-transactions] Error creating income:', insertError)
        } else {
          console.log('[process-recurring-transactions] Created income:', income.description)
          incomesCreated++
        }
      }
    }

    console.log('[process-recurring-transactions] Incomes: created=', incomesCreated, 'skipped=', incomesSkipped)

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Recurring transactions processed successfully',
      expensesCreated,
      expensesSkipped,
      incomesCreated,
      incomesSkipped,
      processedMonth: startOfMonth
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('[process-recurring-transactions] Error:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})