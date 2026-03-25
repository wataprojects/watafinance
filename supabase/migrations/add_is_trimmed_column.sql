-- Migration: Add is_trimmed column to expenses table
-- 
-- Purpose: This column tracks which subscription expenses have been "trimmed" 
-- (cancelled by the user to save money). When is_trimmed = true, the expense
-- is excluded from the total expenses calculation.
--
-- Run this in: Supabase Dashboard > SQL Editor

-- Add the is_trimmed column if it doesn't exist
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS is_trimmed BOOLEAN DEFAULT false;

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'expenses' AND column_name = 'is_trimmed';