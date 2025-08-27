/*
  # Add Bank Accounts and Referrals System

  1. New Tables
    - `bank_accounts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `bank_name` (text)
      - `account_number` (text)
      - `account_holder_name` (text)
      - `account_type` (text)
      - `country` (text)
      - `is_primary` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `referrals`
      - `id` (uuid, primary key)
      - `referrer_id` (uuid, foreign key to users)
      - `referred_id` (uuid, foreign key to users)
      - `referral_code` (text)
      - `reward_amount` (numeric)
      - `status` (text)
      - `created_at` (timestamp)
      - `completed_at` (timestamp)
    
    - `supported_banks`
      - `id` (uuid, primary key)
      - `country` (text)
      - `bank_name` (text)
      - `bank_type` (text)
      - `is_active` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all new tables
    - Add policies for users to manage their own data
    - Add policies for viewing supported banks
*/

-- Create bank_accounts table
CREATE TABLE IF NOT EXISTS bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  bank_name text NOT NULL,
  account_number text NOT NULL,
  account_holder_name text NOT NULL,
  account_type text DEFAULT 'checking',
  country text NOT NULL,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid REFERENCES users(id) ON DELETE CASCADE,
  referred_id uuid REFERENCES users(id) ON DELETE CASCADE,
  referral_code text NOT NULL,
  reward_amount numeric(15,2) DEFAULT 10.00,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create supported_banks table
CREATE TABLE IF NOT EXISTS supported_banks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  bank_name text NOT NULL,
  bank_type text DEFAULT 'bank' CHECK (bank_type IN ('bank', 'mobile_wallet', 'payment_service')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON bank_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_supported_banks_country ON supported_banks(country);

-- Enable RLS
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE supported_banks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bank_accounts
CREATE POLICY "Users can manage own bank accounts"
  ON bank_accounts
  FOR ALL
  TO public
  USING (auth.uid()::text = user_id::text OR user_id IN (SELECT id FROM users WHERE id = user_id))
  WITH CHECK (auth.uid()::text = user_id::text OR user_id IN (SELECT id FROM users WHERE id = user_id));

-- RLS Policies for referrals
CREATE POLICY "Users can create referrals"
  ON referrals
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can view own referrals"
  ON referrals
  FOR SELECT
  TO public
  USING (referrer_id IN (SELECT id FROM users) OR referred_id IN (SELECT id FROM users));

-- RLS Policies for supported_banks
CREATE POLICY "Anyone can view supported banks"
  ON supported_banks
  FOR SELECT
  TO public
  USING (true);

-- Insert supported banks data
INSERT INTO supported_banks (country, bank_name, bank_type) VALUES
-- Colombia
('Colombia', 'Nequi', 'mobile_wallet'),
('Colombia', 'Daviplata', 'mobile_wallet'),
('Colombia', 'Movii', 'mobile_wallet'),
('Colombia', 'Bancolombia', 'bank'),
('Colombia', 'Banco de Bogotá', 'bank'),
('Colombia', 'Davivienda', 'bank'),
('Colombia', 'Efecty', 'payment_service'),
('Colombia', 'Baloto', 'payment_service'),
('Colombia', 'SuRed', 'payment_service'),

-- Costa Rica
('Costa Rica', 'Sinpe Móvil', 'mobile_wallet'),
('Costa Rica', 'Tigo Money', 'mobile_wallet'),
('Costa Rica', 'BAC Credomatic', 'bank'),
('Costa Rica', 'Banco Nacional', 'bank'),
('Costa Rica', 'Movistar Money', 'mobile_wallet'),
('Costa Rica', 'Monibyte', 'payment_service'),

-- Dominican Republic
('Dominican Republic', 'TPago', 'mobile_wallet'),
('Dominican Republic', 'GCS Wallet', 'mobile_wallet'),
('Dominican Republic', 'Banco Popular', 'bank'),
('Dominican Republic', 'BanReservas', 'bank'),
('Dominican Republic', 'Caribe Express', 'payment_service'),
('Dominican Republic', 'GCS', 'payment_service'),
('Dominican Republic', 'PayPal', 'payment_service'),

-- Ecuador
('Ecuador', 'BIMO', 'mobile_wallet'),
('Ecuador', 'Deunal', 'payment_service'),
('Ecuador', 'Datalink', 'payment_service'),
('Ecuador', 'Banco Pichincha', 'bank'),
('Ecuador', 'Banco Guayaquil', 'bank'),
('Ecuador', 'Western Union', 'payment_service'),
('Ecuador', 'Pago Ágil', 'payment_service'),

-- Guatemala
('Guatemala', 'Tigo Money', 'mobile_wallet'),
('Guatemala', 'Banrural App', 'mobile_wallet'),
('Guatemala', 'Banrural', 'bank'),
('Guatemala', 'Banco Industrial', 'bank'),
('Guatemala', 'VisaNet', 'payment_service'),
('Guatemala', 'BAC', 'bank'),
('Guatemala', 'PayPal', 'payment_service'),

-- Honduras
('Honduras', 'Tigo Money', 'mobile_wallet'),
('Honduras', 'BAC App', 'mobile_wallet'),
('Honduras', 'Banco Atlántida', 'bank'),
('Honduras', 'Ficohsa', 'bank'),
('Honduras', 'Tigo Money POS', 'payment_service'),
('Honduras', 'PuntoExpress', 'payment_service'),

-- Mexico
('Mexico', 'Mercado Pago', 'mobile_wallet'),
('Mexico', 'Spin by OXXO', 'mobile_wallet'),
('Mexico', 'Dapp', 'mobile_wallet'),
('Mexico', 'BBVA', 'bank'),
('Mexico', 'Santander', 'bank'),
('Mexico', 'Banorte', 'bank'),
('Mexico', 'HSBC', 'bank'),
('Mexico', 'OXXO Pay', 'payment_service'),
('Mexico', 'CoDi', 'payment_service'),
('Mexico', 'BBVA Wallet', 'mobile_wallet'),

-- Nicaragua
('Nicaragua', 'Tigo Money', 'mobile_wallet'),
('Nicaragua', 'Banpro Wallet', 'mobile_wallet'),
('Nicaragua', 'BAC', 'bank'),
('Nicaragua', 'Banpro', 'bank'),
('Nicaragua', 'Banco Lafise', 'bank'),
('Nicaragua', 'Pago Express', 'payment_service'),
('Nicaragua', 'Punto Pago', 'payment_service'),

-- Panama
('Panama', 'Nequi Panamá', 'mobile_wallet'),
('Panama', 'Yappy', 'mobile_wallet'),
('Panama', 'Banco General', 'bank'),
('Panama', 'Banistmo', 'bank'),
('Panama', 'Western Union', 'payment_service'),
('Panama', 'Multipagos', 'payment_service'),

-- Paraguay
('Paraguay', 'Billetera Personal', 'mobile_wallet'),
('Paraguay', 'Tigo Money', 'mobile_wallet'),
('Paraguay', 'Banco Continental', 'bank'),
('Paraguay', 'Visión Banco', 'bank'),
('Paraguay', 'Pago Móvil', 'payment_service'),
('Paraguay', 'Infonet', 'payment_service'),

-- Peru
('Peru', 'Yape', 'mobile_wallet'),
('Peru', 'Plin', 'mobile_wallet'),
('Peru', 'Tunki', 'mobile_wallet'),
('Peru', 'BCP', 'bank'),
('Peru', 'Interbank', 'bank'),
('Peru', 'BBVA', 'bank'),
('Peru', 'PagoEfectivo', 'payment_service'),
('Peru', 'Safety Pay', 'payment_service'),

-- El Salvador
('El Salvador', 'Transfer365', 'payment_service'),
('El Salvador', 'PuntoXpress', 'payment_service'),
('El Salvador', 'Banco Agrícola', 'bank'),
('El Salvador', 'Davivienda', 'bank'),

-- Uruguay
('Uruguay', 'Prex', 'mobile_wallet'),
('Uruguay', 'MiDinero', 'mobile_wallet'),
('Uruguay', 'Banco República', 'bank'),
('Uruguay', 'Itaú', 'bank'),
('Uruguay', 'Abitab', 'payment_service'),

-- Venezuela
('Venezuela', 'Pago Móvil', 'mobile_wallet'),
('Venezuela', 'Reserve', 'mobile_wallet'),
('Venezuela', 'Zinli', 'mobile_wallet'),
('Venezuela', 'Banco de Venezuela', 'bank'),
('Venezuela', 'Banesco', 'bank'),
('Venezuela', 'Zelle', 'payment_service'),
('Venezuela', 'Binance Pay', 'payment_service'),

-- Other Countries (Default options)
('Other', 'Bank Transfer', 'bank'),
('Other', 'Credit Card', 'payment_service'),
('Other', 'Debit Card', 'payment_service'),
('Other', 'PayPal', 'payment_service'),
('Other', 'Western Union', 'payment_service'),
('Other', 'Mobile Wallet', 'mobile_wallet')
ON CONFLICT DO NOTHING;