/**
 * Recurring Transactions Utilities
 * 
 * Handles expansion of recurring transactions across months
 * and calculation of totals considering active periods.
 */

export interface RecurringItem {
  is_recurring: boolean;
  date: string;
  start_date?: string | null;
  end_date?: string | null;
  [key: string]: any;
}

/**
 * Determines if a recurring transaction is active in a specific month
 * 
 * @param item - The transaction item with is_recurring, date, start_date, end_date
 * @param year - The year to check (e.g., 2026)
 * @param month - The month to check (0-11, e.g., 0 = January)
 * @returns true if the recurring transaction should appear in this month
 */
export function isRecurringActiveInMonth(
  item: RecurringItem,
  year: number,
  month: number
): boolean {
  // Non-recurring items only appear in their exact month
  if (!item.is_recurring) return false;
  
  // Determine the start date of the recurring item
  // If start_date is set, use it; otherwise use the original date
  const itemStart = item.start_date 
    ? new Date(item.start_date + 'T00:00:00')
    : new Date(item.date + 'T00:00:00');
  
  // Determine the end date (if any)
  const itemEnd = item.end_date 
    ? new Date(item.end_date + 'T00:00:00')
    : null;
  
  // Calculate the start and end of the month we're checking
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0); // Last day of month
  
  // A recurring item is active in this month if:
  // 1. The month's end is on or after the item's start date
  // 2. AND either:
  //    - There's no end date, OR
  //    - The month's start is on or before the item's end date
  const afterStart = monthEnd >= itemStart;
  const beforeEnd = !itemEnd || monthStart <= itemEnd;
  
  return afterStart && beforeEnd;
}

/**
 * Expands recurring items to show instances for a specific month
 * 
 * @param items - Array of transaction items
 * @param year - The year to check
 * @param month - The month to check (0-11)
 * @returns Array with expanded recurring items that are active in this month
 */
export function expandRecurringToMonths<T extends RecurringItem>(
  items: T[],
  year: number,
  month: number
): Array<T & { is_expanded: boolean; display_date: string }> {
  return items.map(item => {
    const isActive = isRecurringActiveInMonth(item, year, month);
    
    if (isActive) {
      // Generate display date for this month (first day of the month)
      const displayDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      
      return {
        ...item,
        is_expanded: item.is_recurring,
        display_date: displayDate
      };
    }
    
    return null;
  }).filter((item): item is T & { is_expanded: boolean; display_date: string } => item !== null);
}

/**
 * Counts how many months a recurring item is active in a year
 * 
 * @param item - The recurring transaction item
 * @param year - The year to check
 * @returns Number of months the item is active (1-12)
 */
export function countActiveMonthsInYear(
  item: RecurringItem,
  year: number
): number {
  if (!item.is_recurring) return 1;
  
  let count = 0;
  for (let month = 0; month < 12; month++) {
    if (isRecurringActiveInMonth(item, year, month)) {
      count++;
    }
  }
  return count;
}

/**
 * Calculates the total amount for a month, accounting for recurring transactions
 * 
 * @param items - Array of transaction items
 * @param year - The year to check
 * @param month - The month to check (0-11)
 * @returns Object with total amount and breakdown by category
 */
export function calculateMonthlyTotal<T extends RecurringItem>(
  items: T[],
  year: number,
  month: number
): { total: number; byCategory: Record<string, number> } {
  const expandedItems = expandRecurringToMonths(items, year, month);
  
  let total = 0;
  const byCategory: Record<string, number> = {};
  
  expandedItems.forEach(item => {
    const amount = parseFloat(item.amount) || 0;
    const category = item.category || 'other';
    
    total += amount;
    byCategory[category] = (byCategory[category] || 0) + amount;
  });
  
  return { total, byCategory };
}

/**
 * Calculates the annualized total for a recurring item (amount × active months)
 * 
 * @param item - The recurring transaction item
 * @param year - The year to check
 * @returns The annualized amount
 */
export function calculateAnnualizedAmount(
  item: RecurringItem,
  year: number
): number {
  const amount = parseFloat(item.amount) || 0;
  const activeMonths = countActiveMonthsInYear(item, year);
  return amount * activeMonths;
}

/**
 * Filters items for a specific month, expanding recurring ones
 * 
 * @param items - Array of transaction items
 * @param year - The year to check ('all' for all years)
 * @param month - The month to check ('all' for all months, or 0-11)
 * @returns Filtered and expanded items
 */
export function filterItemsForView<T extends RecurringItem>(
  items: T[],
  year: string,
  month: string
): Array<T & { is_expanded: boolean; display_date: string }> {
  // If showing all time, return all items (not expanded)
  if (year === 'all' && month === 'all') {
    return items.map(item => ({
      ...item,
      is_expanded: false,
      display_date: item.date
    }));
  }
  
  // If showing a specific year but all months
  if (year !== 'all' && month === 'all') {
    const viewYear = parseInt(year);
    const result: Array<T & { is_expanded: boolean; display_date: string }> = [];
    
    for (let m = 0; m < 12; m++) {
      const expanded = expandRecurringToMonths(items, viewYear, m);
      result.push(...expanded);
    }
    
    return result;
  }
  
  // If showing specific month
  const viewYear = parseInt(year);
  const viewMonth = parseInt(month) - 1; // Convert from 1-12 to 0-11
  
  return expandRecurringToMonths(items, viewYear, viewMonth);
}

/**
 * Calculates totals for a view (month, year, or all)
 * 
 * @param items - Array of transaction items
 * @param year - The year ('all' or specific year)
 * @param month - The month ('all' or 1-12)
 * @returns Object with total and breakdown by category
 */
export function calculateViewTotal<T extends RecurringItem>(
  items: T[],
  year: string,
  month: string
): { total: number; byCategory: Record<string, number>; itemCount: number } {
  if (year === 'all' && month === 'all') {
    // Sum all items directly
    let total = 0;
    const byCategory: Record<string, number> = {};
    
    items.forEach(item => {
      const amount = parseFloat(item.amount) || 0;
      total += amount;
      const category = item.category || 'other';
      byCategory[category] = (byCategory[category] || 0) + amount;
    });
    
    return { total, byCategory, itemCount: items.length };
  }
  
  if (year !== 'all' && month === 'all') {
    // Sum across all months in a year, counting recurring items per month
    const viewYear = parseInt(year);
    let total = 0;
    const byCategory: Record<string, number> = {};
    let itemCount = 0;
    
    for (let m = 0; m < 12; m++) {
      const expanded = expandRecurringToMonths(items, viewYear, m);
      expanded.forEach(item => {
        const amount = parseFloat(item.amount) || 0;
        total += amount;
        const category = item.category || 'other';
        byCategory[category] = (byCategory[category] || 0) + amount;
        itemCount++;
      });
    }
    
    return { total, byCategory, itemCount };
  }
  
  // Specific month view
  const expanded = filterItemsForView(items, year, month);
  let total = 0;
  const byCategory: Record<string, number> = {};
  
  expanded.forEach(item => {
    const amount = parseFloat(item.amount) || 0;
    total += amount;
    const category = item.category || 'other';
    byCategory[category] = (byCategory[category] || 0) + amount;
  });
  
  return { total, byCategory, itemCount: expanded.length };
}
