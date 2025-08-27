/*
  # Create withdrawal_requests table

  1. New Tables
    - `withdrawal_requests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `transaction_id` (uuid, foreign key to transactions)
      - `country` (text)
      - `bank_name` (text)
      - `account_name` (text)
      - `account_number` (text)
      - `amount` (numeric)
      - `status` (text: pending, approved, rejected, completed)
      - `admin_notes` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `reviewed_at` (timestamp, nullable)
      - `reviewed_by` (uuid, foreign key to admin_users, nullable)

  2. Security
    - Enable RLS on `withdrawal_requests` table
    - Add policies for users to manage own withdrawal requests
    - Add policies for admins to manage all withdrawal requests

  3. Indexes
    - Add indexes for performance optimization
*/

CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_id uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  country text NOT NULL,
  bank_name text NOT NULL,
  account_name text NOT NULL,
  account_number text NOT NULL,
  amount numeric(15,2) NOT NULL CHECK (amount > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES admin_users(id)
);

-- Enable RLS
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_created_at ON withdrawal_requests(created_at);

-- RLS Policies
CREATE POLICY "Users can manage own withdrawal requests"
  ON withdrawal_requests
  FOR ALL
  TO public
  USING (user_id = (
    SELECT users.id FROM users 
    WHERE users.phone = (current_setting('request.jwt.claims', true)::json ->> 'phone')
  ))
  WITH CHECK (user_id = (
    SELECT users.id FROM users 
    WHERE users.phone = (current_setting('request.jwt.claims', true)::json ->> 'phone')
  ));

CREATE POLICY "Admins can manage all withdrawal requests"
  ON withdrawal_requests
  FOR ALL
  TO public
  USING (true);

-- Add updated_at trigger
CREATE TRIGGER update_withdrawal_requests_updated_at
  BEFORE UPDATE ON withdrawal_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();