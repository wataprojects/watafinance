-- Add loan_id column to investments table
ALTER TABLE investments ADD COLUMN loan_id UUID REFERENCES loans(id) ON DELETE SET NULL;

-- Enable RLS on the new column if not already enabled
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

-- Create policy for loan_id update (users can only update their own data)
DROP POLICY IF EXISTS "investments_update_loan_id_policy" ON investments;
CREATE POLICY "investments_update_loan_id_policy" ON investments
FOR UPDATE TO authenticated USING (auth.uid() = user_id);