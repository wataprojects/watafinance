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

    // Helper to process a table (expenses or incomes)
    const processTable = async (tableName: 'expenses' | 'incomes') => {
      console.log(`[process-recurring-transactions] Processing recurring ${tableName}...`)

      // Get all recurring items for this user that are active
      const { data: recurringItems, error: fetchError } = await supabaseAdmin
        .from(tableName)
        .select('*')
        .eq('user_id', user.id)
        .eq('is_recurring', true)
        .or(`end_date.is.null,end_date.gte.${startOfMonth}`)

      if (fetchError) {
        console.error(`[process-recurring-transactions] Error fetching ${tableName}:`, fetchError)
        return { created: 0, skipped: 0 }
      }

      let created = 0
      let skipped = 0

      if (recurringItems && recurringItems.length > 0) {
        // Template logic: find the "source" of each series
        const seriesTemplates = new Map()
        for (const item of recurringItems) {
          const key = `${item.description}-${item.category}`
          if (!seriesTemplates.has(key) || new Date(item.date) > new Date(seriesTemplates.get(key).date)) {
            seriesTemplates.set(key, item)
          }
        }

        for (const template of seriesTemplates.values()) {
          if (template.is_trimmed) {
            skipped++
            continue
          }

          // Check if start_date allows this month
          if (template.start_date && template.start_date > endOfMonth) {
            skipped++
            continue
          }

          // Determine which days this should be created for this month
          const daysToCreate: number[] = []
          
          if (template.frequency === 'monthly' || !template.frequency) {
            const paymentDays = template.payment_days || [new Date(template.date).getDate()]
            paymentDays.forEach((day: number) => {
              const actualDay = day === 32 ? lastDayOfMonth : Math.min(day, lastDayOfMonth)
              daysToCreate.push(actualDay)
            })
          } else if (template.frequency === 'weekly') {
            const paymentDays = template.payment_days || [new Date(template.date).getDay() || 7] // 1-7
            // Find all occurrences of these days in the current month
            for (let d = 1; d <= lastDayOfMonth; d++) {
              const date = new Date(currentYear, currentMonth - 1, d)
              const dayOfWeek = date.getDay() || 7 // 1-7 (Mon-Sun)
              if (paymentDays.includes(dayOfWeek)) {
                daysToCreate.push(d)
              }
            }
          } else if (template.frequency === 'quarterly') {
            // Only every 3 months from start_date
            const startDate = new Date(template.start_date || template.date)
            const monthsDiff = (currentYear - startDate.getFullYear()) * 12 + (currentMonth - 1 - startDate.getMonth())
            if (monthsDiff % 3 === 0) {
              const paymentDays = template.payment_days || [startDate.getDate()]
              paymentDays.forEach((day: number) => {
                const actualDay = day === 32 ? lastDayOfMonth : Math.min(day, lastDayOfMonth)
                daysToCreate.push(actualDay)
              })
            }
          } else if (template.frequency === 'annual') {
            // Only once a year
            const startDate = new Date(template.start_date || template.date)
            if (startDate.getMonth() + 1 === currentMonth) {
              const paymentDays = template.payment_days || [startDate.getDate()]
              paymentDays.forEach((day: number) => {
                const actualDay = day === 32 ? lastDayOfMonth : Math.min(day, lastDayOfMonth)
                daysToCreate.push(actualDay)
              })
            }
          }

          // Create records for each day
          for (const day of daysToCreate) {
            const targetDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
            
            // Check if already exists for this specific day
            const { data: existing, error: existingError } = await supabaseAdmin
              .from(tableName)
              .select('id')
              .eq('user_id', user.id)
              .eq('description', template.description)
              .eq('category', template.category)
              .eq('date', targetDate)
              .limit(1)
              .maybeSingle()

            if (existingError) {
              console.error(`[process-recurring-transactions] Error checking existing ${tableName}:`, existingError)
              continue
            }

            if (existing) {
              skipped++
              continue
            }

            // Create the record
            const insertData: any = {
              user_id: user.id,
              amount: template.amount,
              description: template.description,
              category: template.category,
              date: targetDate,
              is_recurring: true,
              investment_id: template.investment_id,
              patrimony_id: template.patrimony_id,
              is_trimmed: template.is_trimmed || false,
              // Use template's start_date if available, otherwise use template's original date
              // This ensures occurrences have start_date !== date (unlike the template)
              start_date: template.start_date || template.date,
              frequency: template.frequency,
              recurrence_interval: template.recurrence_interval,
              recurrence_unit: template.recurrence_unit,
              payment_days: template.payment_days
            }

            if (tableName === 'expenses') {
              insertData.has_scheduled_change = template.has_scheduled_change
              insertData.scheduled_change_date = template.scheduled_change_date
              insertData.scheduled_new_amount = template.scheduled_new_amount
              insertData.scheduled_change_type = template.scheduled_change_type
            } else {
              insertData.is_passive = template.is_passive || false
            }

            const { error: insertError } = await supabaseAdmin
              .from(tableName)
              .insert(insertData)

            if (insertError) {
              console.error(`[process-recurring-transactions] Error creating ${tableName}:`, insertError)
            } else {
              console.log(`[process-recurring-transactions] Created ${tableName}:`, template.description, 'for day', day)
              created++
            }
          }
        }
      }
      return { created, skipped }
    }

    const expenseResults = await processTable('expenses')
    const incomeResults = await processTable('incomes')

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Recurring transactions processed successfully',
      expensesCreated: expenseResults.created,
      expensesSkipped: expenseResults.skipped,
      incomesCreated: incomeResults.created,
      incomesSkipped: incomeResults.skipped,
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
