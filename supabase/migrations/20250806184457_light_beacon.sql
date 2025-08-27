/*
  # Fix referral code system and populate missing codes

  1. Recreate the referral code trigger function
  2. Ensure trigger is properly attached
  3. Populate missing referral codes for existing users
  4. Verify uniqueness constraints
*/

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS set_users_referral_code ON users;
DROP TRIGGER IF EXISTS trigger_set_referral_code ON users;
DROP FUNCTION IF EXISTS set_referral_code();

-- Create the referral code generation function
CREATE OR REPLACE FUNCTION set_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  -- Only set referral_code if it's NULL or empty
  IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
    -- Generate a unique 8-character alphanumeric code
    LOOP
      NEW.referral_code := upper(
        substr(
          encode(gen_random_bytes(6), 'base64'),
          1, 8
        )
      );
      -- Remove any non-alphanumeric characters and ensure it's exactly 8 chars
      NEW.referral_code := regexp_replace(NEW.referral_code, '[^A-Z0-9]', '', 'g');
      NEW.referral_code := substr(NEW.referral_code || 'ABCD1234', 1, 8);
      
      -- Check if this code already exists
      IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE referral_code = NEW.referral_code 
        AND id != NEW.id
      ) THEN
        EXIT; -- Code is unique, exit loop
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER set_users_referral_code
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_referral_code();

-- Function to generate a unique referral code
CREATE OR REPLACE FUNCTION generate_unique_referral_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
BEGIN
  LOOP
    -- Generate a unique 8-character alphanumeric code
    new_code := upper(
      substr(
        encode(gen_random_bytes(6), 'base64'),
        1, 8
      )
    );
    -- Remove any non-alphanumeric characters and ensure it's exactly 8 chars
    new_code := regexp_replace(new_code, '[^A-Z0-9]', '', 'g');
    new_code := substr(new_code || 'ABCD1234', 1, 8);
    
    -- Check if this code already exists
    IF NOT EXISTS (SELECT 1 FROM users WHERE referral_code = new_code) THEN
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Update all users with NULL referral_code
DO $$
DECLARE
  user_record RECORD;
  new_code TEXT;
BEGIN
  -- Loop through all users with NULL referral_code
  FOR user_record IN 
    SELECT id FROM users WHERE referral_code IS NULL OR referral_code = ''
  LOOP
    -- Generate a unique code for this user
    new_code := generate_unique_referral_code();
    
    -- Update the user with the new referral code
    UPDATE users 
    SET referral_code = new_code, updated_at = now()
    WHERE id = user_record.id;
    
    RAISE NOTICE 'Updated user % with referral code %', user_record.id, new_code;
  END LOOP;
END;
$$;

-- Clean up the temporary function
DROP FUNCTION generate_unique_referral_code();

-- Verify all users now have referral codes
DO $$
DECLARE
  null_count INTEGER;
  total_count INTEGER;
  duplicate_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO null_count FROM users WHERE referral_code IS NULL OR referral_code = '';
  SELECT COUNT(*) INTO total_count FROM users;
  SELECT COUNT(*) - COUNT(DISTINCT referral_code) INTO duplicate_count FROM users WHERE referral_code IS NOT NULL;
  
  RAISE NOTICE 'Referral code verification:';
  RAISE NOTICE '- Total users: %', total_count;
  RAISE NOTICE '- Users with NULL referral_code: %', null_count;
  RAISE NOTICE '- Duplicate referral codes: %', duplicate_count;
  
  IF null_count > 0 THEN
    RAISE WARNING 'Some users still have NULL referral codes!';
  END IF;
  
  IF duplicate_count > 0 THEN
    RAISE WARNING 'Duplicate referral codes detected!';
  END IF;
  
  IF null_count = 0 AND duplicate_count = 0 THEN
    RAISE NOTICE 'All users have unique referral codes - SUCCESS!';
  END IF;
END;
$$;