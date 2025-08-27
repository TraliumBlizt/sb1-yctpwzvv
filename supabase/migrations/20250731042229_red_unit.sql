/*
  # Add currency support to users table

  1. Changes
    - Add `country` column to store user's country
    - Add `currency` column to store user's preferred currency
    - Add `currency_symbol` column to store currency symbol for display

  2. Security
    - Maintain existing RLS policies
    - No changes to security model
*/

DO $$
BEGIN
  -- Add country column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'country'
  ) THEN
    ALTER TABLE users ADD COLUMN country text DEFAULT 'United States';
  END IF;

  -- Add currency column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'currency'
  ) THEN
    ALTER TABLE users ADD COLUMN currency text DEFAULT 'USD';
  END IF;

  -- Add currency_symbol column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'currency_symbol'
  ) THEN
    ALTER TABLE users ADD COLUMN currency_symbol text DEFAULT '$';
  END IF;
END $$;