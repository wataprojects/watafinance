-- Add is_trimmed column to expenses table for subscription trimming feature
-- This column tracks whether a subscription has been "trimmed" (marked as cancelled but not deleted)

ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS is_trimmed BOOLEAN DEFAULT false;

-- Create index for better query performance on trimmed subscriptions
CREATE INDEX IF NOT EXISTS idx_expenses_is_trimmed ON expenses(is_trimmed) WHERE is_trimmed = true;

-- Add comment for documentation
COMMENT ON COLUMN expenses.is_trimmed IS 'Tracks if a subscription expense has been trimmed (cancelled to save money)';