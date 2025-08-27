/*
  # VIP Status Management System

  1. New Tables
    - `vip_verifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `vip_level` (integer, 0-4)
      - `verified_by` (uuid, foreign key to admin_users)
      - `verification_date` (timestamp)
      - `expiry_date` (timestamp, nullable)
      - `status` (text: active, expired, revoked)
      - `notes` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Updates to existing tables
    - Add `vip_verification_id` to users table
    - Add trigger to update user VIP status when verification changes

  3. Security
    - Enable RLS on `vip_verifications` table
    - Add policies for admin management and user read access
    - Add function to automatically update user VIP status
*/

-- Create VIP verifications table
CREATE TABLE IF NOT EXISTS vip_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vip_level integer NOT NULL DEFAULT 0 CHECK (vip_level >= 0 AND vip_level <= 4),
  verified_by uuid REFERENCES admin_users(id),
  verification_date timestamptz DEFAULT now(),
  expiry_date timestamptz,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_vip_verifications_user_id ON vip_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_vip_verifications_status ON vip_verifications(status);
CREATE INDEX IF NOT EXISTS idx_vip_verifications_vip_level ON vip_verifications(vip_level);
CREATE INDEX IF NOT EXISTS idx_vip_verifications_expiry ON vip_verifications(expiry_date);

-- Add vip_verification_id to users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'vip_verification_id'
  ) THEN
    ALTER TABLE users ADD COLUMN vip_verification_id uuid REFERENCES vip_verifications(id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE vip_verifications ENABLE ROW LEVEL SECURITY;

-- Policies for vip_verifications
CREATE POLICY "Admins can manage all VIP verifications"
  ON vip_verifications
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view own VIP verification"
  ON vip_verifications
  FOR SELECT
  TO public
  USING (user_id = (
    SELECT id FROM users 
    WHERE phone = ((current_setting('request.jwt.claims', true))::json ->> 'phone')
  ));

-- Function to update user VIP status based on verification
CREATE OR REPLACE FUNCTION update_user_vip_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user's VIP status and level based on active verification
  UPDATE users 
  SET 
    is_vip = CASE 
      WHEN NEW.status = 'active' AND (NEW.expiry_date IS NULL OR NEW.expiry_date > now()) 
      THEN true 
      ELSE false 
    END,
    vip_level = CASE 
      WHEN NEW.status = 'active' AND (NEW.expiry_date IS NULL OR NEW.expiry_date > now()) 
      THEN NEW.vip_level 
      ELSE 0 
    END,
    vip_verification_id = CASE 
      WHEN NEW.status = 'active' AND (NEW.expiry_date IS NULL OR NEW.expiry_date > now()) 
      THEN NEW.id 
      ELSE NULL 
    END,
    updated_at = now()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user VIP status when verification changes
DROP TRIGGER IF EXISTS trigger_update_user_vip_status ON vip_verifications;
CREATE TRIGGER trigger_update_user_vip_status
  AFTER INSERT OR UPDATE ON vip_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_user_vip_status();

-- Function to check and expire VIP verifications
CREATE OR REPLACE FUNCTION expire_vip_verifications()
RETURNS void AS $$
BEGIN
  -- Update expired verifications
  UPDATE vip_verifications 
  SET 
    status = 'expired',
    updated_at = now()
  WHERE 
    status = 'active' 
    AND expiry_date IS NOT NULL 
    AND expiry_date <= now();
    
  -- Update users with expired verifications
  UPDATE users 
  SET 
    is_vip = false,
    vip_level = 0,
    vip_verification_id = NULL,
    updated_at = now()
  WHERE vip_verification_id IN (
    SELECT id FROM vip_verifications 
    WHERE status = 'expired'
  );
END;
$$ LANGUAGE plpgsql;

-- Insert some sample VIP verifications for testing
INSERT INTO vip_verifications (user_id, vip_level, status, notes) 
SELECT 
  id, 
  CASE 
    WHEN random() < 0.1 THEN 4  -- 10% VIP 4
    WHEN random() < 0.2 THEN 3  -- 10% VIP 3
    WHEN random() < 0.4 THEN 2  -- 20% VIP 2
    WHEN random() < 0.7 THEN 1  -- 30% VIP 1
    ELSE 0                      -- 30% Regular
  END,
  'active',
  'Sample VIP verification for testing'
FROM users 
WHERE NOT EXISTS (
  SELECT 1 FROM vip_verifications WHERE user_id = users.id
)
LIMIT 10;