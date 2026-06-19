/**
 * Utility functions for handling recurring amounts
 */

/**
 * Converts an amount with a given frequency to its monthly equivalent
 */
export const getMonthlyAmount = (
  amount: number,
  frequency: string,
  recurrenceInterval?: number,
  recurrenceUnit?: string
): number => {
  const numAmount = parseFloat(String(amount)) || 0;
  switch (frequency) {
    case "weekly":
      return numAmount * 4.33;
    case "monthly":
      return numAmount;
    case "quarterly":
      return numAmount / 3;
    case "annual":
      return numAmount / 12;
    case "custom":
      if (recurrenceUnit === "days")
        return (numAmount * 30) / (recurrenceInterval || 1);
      if (recurrenceUnit === "weeks")
        return (numAmount * 4.33) / (recurrenceInterval || 1);
      if (recurrenceUnit === "months")
        return numAmount / (recurrenceInterval || 1);
      return numAmount;
    default:
      return numAmount;
  }
};
