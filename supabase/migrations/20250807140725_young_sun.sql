/*
  # Add withdrawal password column to users table

  1. Schema Changes
    - Add `withdrawal_password` column to `users` table
    - Column is nullable (text type)
    - Users can have separate withdrawal passwords from login passwords

  2. Notes
    - If withdrawal_password is null, system falls back to regular password
    - Existing users will have null withdrawal_password initially
    - New users can optionally set withdrawal_password
*/

-- Add withdrawal_password column to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'withdrawal_password'
  ) THEN
    ALTER TABLE users ADD COLUMN withdrawal_password text;
  END IF;
END $$;