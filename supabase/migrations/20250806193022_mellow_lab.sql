/*
  # Add invitation tracking system

  1. New Tables
    - `invitations` - Track invitation relationships and status
    - Add invitation tracking fields to existing tables

  2. Security
    - Enable RLS on `invitations` table
    - Add policies for invitation management

  3. Functions
    - Function to validate invitation codes
    - Function to process invitation rewards
*/

-- Create invitations table
CREATE TABLE IF NOT EXISTS invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invited_id uuid REFERENCES users(id) ON DELETE CASCADE,
  invitation_code text NOT NULL,
  reward_amount numeric(15,2) DEFAULT 10.00 NOT NULL,
  status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  completed_at timestamptz,
  
  UNIQUE(inviter_id, invited_id),
  UNIQUE(invitation_code, invited_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invitations_code ON invitations(invitation_code);
CREATE INDEX IF NOT EXISTS idx_invitations_inviter_id ON invitations(inviter_id);
CREATE INDEX IF NOT EXISTS idx_invitations_invited_id ON invitations(invited_id);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);

-- Enable RLS
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own invitations"
  ON invitations
  FOR SELECT
  TO public
  USING (
    inviter_id = (
      SELECT id FROM users 
      WHERE phone = ((current_setting('request.jwt.claims', true))::json ->> 'phone')
    ) OR 
    invited_id = (
      SELECT id FROM users 
      WHERE phone = ((current_setting('request.jwt.claims', true))::json ->> 'phone')
    )
  );

CREATE POLICY "Allow invitation creation"
  ON invitations
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow invitation updates"
  ON invitations
  FOR UPDATE
  TO public
  USING (true);

-- Function to validate invitation code
CREATE OR REPLACE FUNCTION validate_invitation_code(p_invitation_code text)
RETURNS TABLE(
  is_valid boolean,
  inviter_id uuid,
  inviter_username text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    true as is_valid,
    u.id as inviter_id,
    u.username as inviter_username
  FROM users u
  WHERE u.referral_code = p_invitation_code
  AND u.id IS NOT NULL;
  
  -- If no results found, return invalid
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, null::uuid, null::text;
  END IF;
END;
$$;

-- Function to process invitation reward
CREATE OR REPLACE FUNCTION process_invitation_reward()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invitation_record invitations%ROWTYPE;
BEGIN
  -- Only process when order status changes to completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Check if this user has a pending invitation
    SELECT * INTO invitation_record
    FROM invitations
    WHERE invited_id = NEW.user_id
    AND status = 'pending'
    LIMIT 1;
    
    IF FOUND THEN
      -- Update invitation status
      UPDATE invitations
      SET 
        status = 'completed',
        completed_at = now(),
        updated_at = now()
      WHERE id = invitation_record.id;
      
      -- Add reward to inviter's balance
      UPDATE users
      SET 
        balance = balance + invitation_record.reward_amount,
        updated_at = now()
      WHERE id = invitation_record.inviter_id;
      
      -- Create transaction record for the reward
      INSERT INTO transactions (
        user_id,
        type,
        amount,
        status,
        payment_method,
        reference_id,
        notes
      ) VALUES (
        invitation_record.inviter_id,
        'deposit',
        invitation_record.reward_amount,
        'completed',
        'invitation_reward',
        'INV-' || invitation_record.id,
        'Invitation reward for user: ' || NEW.user_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for invitation rewards
DROP TRIGGER IF EXISTS trigger_process_invitation_reward ON orders;
CREATE TRIGGER trigger_process_invitation_reward
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION process_invitation_reward();

-- Update trigger for invitations table
CREATE OR REPLACE FUNCTION update_invitations_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_invitations_updated_at
  BEFORE UPDATE ON invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_invitations_updated_at();