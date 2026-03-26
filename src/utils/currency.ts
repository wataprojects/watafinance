/**
 * Utility functions for currency formatting
 * All currency display in the app should use these functions
 */

/**
 * Format a number as EUR currency with proper decimal places
 * @param amount - The amount to format
 * @param showDecimals - Whether to show decimal places (default: true)
 */
export const formatCurrency = (amount: number, showDecimals: boolean = true): string => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);
};

/**
 * Format a number as EUR currency showing only decimals when needed
 * (e.g., 13.00 shows as "13€" but 13.40 shows as "13,40€")
 */
export const formatCurrencySmart = (amount: number): string => {
  const isWholeNumber = amount % 1 === 0;
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: isWholeNumber ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
};