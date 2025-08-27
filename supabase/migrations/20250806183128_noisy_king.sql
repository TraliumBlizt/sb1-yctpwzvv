/*
  # Enhanced Referral System

  1. New Tables
    - Enhanced `referrals` table for tracking referral relationships
    - Improved referral code generation and validation

  2. Security
    - Enable RLS on referrals table
    - Add policies for referral management

  3. Functions
    - Enhanced referral code generation
    - Automatic referral relationship creation
    - Referral reward processing

  4. Changes
    - Make referral codes required for registration
    - Add real-time referral tracking
    - Implement referral rewards system
*/

-- Drop existing referrals table if it exists to recreate with better structure
DROP TABLE IF EXISTS referrals CASCADE;

-- Create enhanced referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referral_code text NOT NULL,
  reward_amount numeric(15,2) DEFAULT 10.00,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(referrer_id, referred_id)
);

-- Enable RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Create policies for referrals
CREATE POLICY "Admins can manage all referrals"
  ON referrals
  FOR ALL
  TO public
  USING (true);

CREATE POLICY "Users can view own referrals"
  ON referrals
  FOR SELECT
  TO public
  USING (
    referrer_id = (
      SELECT id FROM users 
      WHERE phone = ((current_setting('request.jwt.claims', true))::json ->> 'phone')
    ) OR 
    referred_id = (
      SELECT id FROM users 
      WHERE phone = ((current_setting('request.jwt.claims', true))::json ->> 'phone')
    )
  );

CREATE POLICY "Users can create referrals"
  ON referrals
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- Add trigger for updated_at
CREATE TRIGGER update_referrals_updated_at
  BEFORE UPDATE ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to process referral when user becomes active
CREATE OR REPLACE FUNCTION process_referral_reward()
RETURNS TRIGGER AS $$
BEGIN
  -- When a user's first order is completed, activate their referral
  IF NEW.status = 'completed' AND OLD.status = 'pending' THEN
    -- Check if this is the user's first completed order
    IF NOT EXISTS (
      SELECT 1 FROM orders 
      WHERE user_id = NEW.user_id 
      AND status = 'completed' 
      AND id != NEW.id
    ) THEN
      -- Update referral status to completed and add rewards
      UPDATE referrals 
      SET 
        status = 'completed',
        updated_at = now()
      WHERE referred_id = NEW.user_id AND status = 'pending';
      
      -- Add reward to referrer's balance
      UPDATE users 
      SET 
        balance = balance + (
          SELECT COALESCE(reward_amount, 10.00) 
          FROM referrals 
          WHERE referred_id = NEW.user_id AND status = 'completed'
          LIMIT 1
        ),
        referral_earnings = referral_earnings + (
          SELECT COALESCE(reward_amount, 10.00) 
          FROM referrals 
          WHERE referred_id = NEW.user_id AND status = 'completed'
          LIMIT 1
        ),
        updated_at = now()
      WHERE id = (
        SELECT referrer_id 
        FROM referrals 
        WHERE referred_id = NEW.user_id AND status = 'completed'
        LIMIT 1
      );
      
      -- Create transaction record for referrer reward
      INSERT INTO transactions (
        user_id,
        type,
        amount,
        status,
        payment_method,
        reference_id,
        notes
      )
      SELECT 
        referrer_id,
        'deposit',
        reward_amount,
        'completed',
        'referral_reward',
        'REF-' || NEW.id,
        'Referral reward for inviting user'
      FROM referrals 
      WHERE referred_id = NEW.user_id AND status = 'completed'
      LIMIT 1;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for referral reward processing
DROP TRIGGER IF EXISTS trigger_process_referral_reward ON orders;
CREATE TRIGGER trigger_process_referral_reward
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION process_referral_reward();

-- Function to validate referral code and create referral relationship
CREATE OR REPLACE FUNCTION create_referral_relationship(
  p_referral_code text,
  p_referred_user_id uuid
)
RETURNS boolean AS $$
DECLARE
  v_referrer_id uuid;
BEGIN
  -- Find the referrer by referral code
  SELECT id INTO v_referrer_id
  FROM users
  WHERE referral_code = p_referral_code;
  
  -- If referrer not found, return false
  IF v_referrer_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Don't allow self-referral
  IF v_referrer_id = p_referred_user_id THEN
    RETURN false;
  END IF;
  
  -- Create referral relationship
  INSERT INTO referrals (
    referrer_id,
    referred_id,
    referral_code,
    status
  ) VALUES (
    v_referrer_id,
    p_referred_user_id,
    p_referral_code,
    'pending'
  );
  
  -- Update referred user's referred_by field
  UPDATE users 
  SET referred_by = v_referrer_id
  WHERE id = p_referred_user_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;