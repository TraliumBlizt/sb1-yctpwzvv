/*
  # Handle withdrawal rejection and balance restoration

  1. New Function
    - `handle_withdrawal_rejection()` - Automatically restores user balance when withdrawal is rejected
    
  2. Trigger
    - Monitors withdrawal_requests table for status changes to 'rejected'
    - Automatically calls the function to restore balance
    
  3. Security
    - Only processes rejections (prevents abuse)
    - Updates both transaction and user balance
    - Maintains audit trail
*/

-- Function to handle withdrawal rejection and restore balance
CREATE OR REPLACE FUNCTION handle_withdrawal_rejection()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if status changed to 'rejected' and it wasn't rejected before
  IF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
    -- Update the associated transaction status to 'failed'
    UPDATE transactions 
    SET 
      status = 'failed',
      updated_at = now(),
      notes = COALESCE(notes, '') || ' - Withdrawal rejected and amount restored to balance'
    WHERE id = NEW.transaction_id;
    
    -- Restore the amount to user's balance
    UPDATE users 
    SET 
      balance = balance + NEW.amount,
      updated_at = now()
    WHERE id = NEW.user_id;
    
    -- Log the balance restoration
    INSERT INTO transactions (
      user_id,
      type,
      amount,
      status,
      payment_method,
      reference_id,
      notes
    ) VALUES (
      NEW.user_id,
      'deposit',
      NEW.amount,
      'completed',
      'balance_restoration',
      'RESTORE-' || NEW.id,
      'Balance restored due to withdrawal rejection - Request ID: ' || NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for withdrawal rejection handling
DROP TRIGGER IF EXISTS on_withdrawal_rejection ON withdrawal_requests;
CREATE TRIGGER on_withdrawal_rejection
  AFTER UPDATE ON withdrawal_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_withdrawal_rejection();