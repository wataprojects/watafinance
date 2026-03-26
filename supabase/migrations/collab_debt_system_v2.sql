-- ============================================
-- Collaborative Debt System v2 - Database
-- ============================================

-- 1. Modify debts table to add new columns
ALTER TABLE debts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' 
  CHECK (status IN ('pending', 'accepted', 'negotiating', 'partially_paid', 'paid', 'rejected'));

ALTER TABLE debts ADD COLUMN IF NOT EXISTS creditor_email TEXT;
ALTER TABLE debts ADD COLUMN IF NOT EXISTS associated_user_id UUID REFERENCES auth.users(id);
ALTER TABLE debts ADD COLUMN IF NOT EXISTS original_creator_id UUID REFERENCES auth.users(id);
ALTER TABLE debts ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;
ALTER TABLE debts ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE debts ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;
ALTER TABLE debts ADD COLUMN IF NOT EXISTS paid_amount NUMERIC DEFAULT 0;

-- Update existing records to have 'pending' status
UPDATE debts SET status = 'pending' WHERE status IS NULL;

-- 2. Create debt_events table (Timeline)
CREATE TABLE IF NOT EXISTS debt_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  debt_id UUID REFERENCES debts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE debt_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for debt_events
DROP POLICY IF EXISTS "Users can view events for their debts" ON debt_events;
CREATE POLICY "Users can view events for their debts" ON debt_events
  FOR SELECT USING (
    debt_id IN (
      SELECT id FROM debts 
      WHERE user_id = auth.uid() 
      OR associated_user_id = auth.uid()
      OR original_creator_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert events for their debts" ON debt_events;
CREATE POLICY "Users can insert events for their debts" ON debt_events
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 3. Create debt_messages table (Chat)
CREATE TABLE IF NOT EXISTS debt_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  debt_id UUID REFERENCES debts(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE debt_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for debt_messages
DROP POLICY IF EXISTS "Users can view messages for their debts" ON debt_messages;
CREATE POLICY "Users can view messages for their debts" ON debt_messages
  FOR SELECT USING (
    debt_id IN (
      SELECT id FROM debts 
      WHERE user_id = auth.uid() 
      OR associated_user_id = auth.uid()
      OR original_creator_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert messages for their debts" ON debt_messages;
CREATE POLICY "Users can insert messages for their debts" ON debt_messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- 4. Create debt_payments table (Partial payments)
CREATE TABLE IF NOT EXISTS debt_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  debt_id UUID REFERENCES debts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  amount NUMERIC NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE debt_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for debt_payments
DROP POLICY IF EXISTS "Users can view payments for their debts" ON debt_payments;
CREATE POLICY "Users can view payments for their debts" ON debt_payments
  FOR SELECT USING (
    debt_id IN (
      SELECT id FROM debts 
      WHERE user_id = auth.uid() 
      OR associated_user_id = auth.uid()
      OR original_creator_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert payments for their debts" ON debt_payments;
CREATE POLICY "Users can insert payments for their debts" ON debt_payments
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 5. Create debt_reminders table
CREATE TABLE IF NOT EXISTS debt_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  debt_id UUID REFERENCES debts(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id),
  sent_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE debt_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for debt_reminders
DROP POLICY IF EXISTS "Users can view reminders for their debts" ON debt_reminders;
CREATE POLICY "Users can view reminders for their debts" ON debt_reminders
  FOR SELECT USING (
    debt_id IN (
      SELECT id FROM debts 
      WHERE user_id = auth.uid() 
      OR associated_user_id = auth.uid()
      OR original_creator_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert reminders for their debts" ON debt_reminders;
CREATE POLICY "Users can insert reminders for their debts" ON debt_reminders
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- 6. Update existing debts to set original_creator_id = user_id
UPDATE debts SET original_creator_id = user_id WHERE original_creator_id IS NULL;

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_debt_events_debt_id ON debt_events(debt_id);
CREATE INDEX IF NOT EXISTS idx_debt_messages_debt_id ON debt_messages(debt_id);
CREATE INDEX IF NOT EXISTS idx_debt_payments_debt_id ON debt_payments(debt_id);
CREATE INDEX IF NOT EXISTS idx_debts_status ON debts(status);
CREATE INDEX IF NOT EXISTS idx_debts_associated_user_id ON debts(associated_user_id);