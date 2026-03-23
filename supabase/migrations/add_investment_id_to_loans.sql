-- Add investment_id column to loans table
ALTER TABLE loans ADD COLUMN IF NOT EXISTS investment_id UUID REFERENCES investments(id) ON DELETE SET NULL;

-- Add patrimony_id column to loans table  
ALTER TABLE loans ADD COLUMN IF NOT EXISTS patrimony_id UUID REFERENCES patrimony(id) ON DELETE SET NULL;