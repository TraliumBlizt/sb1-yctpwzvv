/*
  # Enhanced Profile Features

  1. New Tables
    - `bank_accounts` - Store user bank account information for withdrawals
    - `deposit_proofs` - Store deposit proof images and bank details
    - `referrals` - Track referral relationships and rewards

  2. Enhanced Users Table
    - Add language preference
    - Add referral tracking fields

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies for user data access
*/

-- Add language and referral fields to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'language'
  ) THEN
    ALTER TABLE users ADD COLUMN language text DEFAULT 'en';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'referral_earnings'
  ) THEN
    ALTER TABLE users ADD COLUMN referral_earnings numeric(15,2) DEFAULT 0.00;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'referred_by'
  ) THEN
    ALTER TABLE users ADD COLUMN referred_by uuid REFERENCES users(id);
  END IF;
END $$;

-- Create bank_accounts table
CREATE TABLE IF NOT EXISTS bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  country text NOT NULL,
  bank_name text NOT NULL,
  account_name text NOT NULL,
  account_number text NOT NULL,
  account_type text DEFAULT 'checking',
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create deposit_proofs table
CREATE TABLE IF NOT EXISTS deposit_proofs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_id uuid REFERENCES transactions(id) ON DELETE CASCADE,
  country text NOT NULL,
  bank_name text NOT NULL,
  sender_account_name text NOT NULL,
  sender_account_number text NOT NULL,
  receiver_account_name text NOT NULL,
  receiver_account_number text NOT NULL,
  amount numeric(15,2) NOT NULL,
  proof_image_url text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create referrals table
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
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposit_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bank_accounts
CREATE POLICY "Users can manage own bank accounts"
  ON bank_accounts
  FOR ALL
  TO public
  USING (user_id = (SELECT id FROM users WHERE phone = current_setting('request.jwt.claims', true)::json->>'phone'))
  WITH CHECK (user_id = (SELECT id FROM users WHERE phone = current_setting('request.jwt.claims', true)::json->>'phone'));

-- RLS Policies for deposit_proofs
CREATE POLICY "Users can manage own deposit proofs"
  ON deposit_proofs
  FOR ALL
  TO public
  USING (user_id = (SELECT id FROM users WHERE phone = current_setting('request.jwt.claims', true)::json->>'phone'))
  WITH CHECK (user_id = (SELECT id FROM users WHERE phone = current_setting('request.jwt.claims', true)::json->>'phone'));

-- RLS Policies for referrals
CREATE POLICY "Users can view own referrals"
  ON referrals
  FOR SELECT
  TO public
  USING (
    referrer_id = (SELECT id FROM users WHERE phone = current_setting('request.jwt.claims', true)::json->>'phone') OR
    referred_id = (SELECT id FROM users WHERE phone = current_setting('request.jwt.claims', true)::json->>'phone')
  );

CREATE POLICY "Users can create referrals"
  ON referrals
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON bank_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_deposit_proofs_user_id ON deposit_proofs(user_id);
CREATE INDEX IF NOT EXISTS idx_deposit_proofs_status ON deposit_proofs(status);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);

-- Update trigger for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bank_accounts_updated_at
    BEFORE UPDATE ON bank_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deposit_proofs_updated_at
    BEFORE UPDATE ON deposit_proofs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();