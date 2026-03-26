// Calculates the visual width of a progress bar (minimum 5%)
export const getVisualBarWidth = (percentage: number, minWidth = 5): number => {
  return Math.max(percentage, minWidth);
};
