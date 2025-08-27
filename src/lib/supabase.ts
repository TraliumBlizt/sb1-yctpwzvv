import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          phone: string;
          password: string;
          first_name: string;
          last_name: string;
          balance: number;
          is_vip: boolean;
          avatar: string | null;
          country: string | null;
          currency: string | null;
          currency_symbol: string | null;
          created_at: string;
          updated_at: string;
          vip_level: number;
          vip_verification_id: string | null;
        };
        Insert: {
          id: string;
          username: string;
          phone: string;
          password: string;
          first_name: string;
          last_name: string;
          balance?: number;
          is_vip?: boolean;
          avatar?: string | null;
          country?: string | null;
          currency?: string | null;
          currency_symbol?: string | null;
          created_at?: string;
          updated_at?: string;
          vip_level?: number;
          vip_verification_id?: string | null;
        };
        Update: {
          id?: string;
          username?: string;
          phone?: string;
          password?: string;
          first_name?: string;
          last_name?: string;
          balance?: number;
          is_vip?: boolean;
          avatar?: string | null;
          country?: string | null;
          currency?: string | null;
          currency_symbol?: string | null;
          created_at?: string;
          updated_at?: string;
          vip_level?: number;
          vip_verification_id?: string | null;
        };
      };
      country_banks: {
        Row: {
          id: string;
          country: string;
          bank_name: string;
          account_name: string;
          account_number: string;
          bank_type: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          country: string;
          bank_name: string;
          account_name?: string;
          account_number?: string;
          bank_type?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          country?: string;
          bank_name?: string;
          account_name?: string;
          account_number?: string;
          bank_type?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      vip_verifications: {
        Row: {
          id: string;
          user_id: string;
          vip_level: number;
          verified_by: string | null;
          verification_date: string;
          expiry_date: string | null;
          status: 'active' | 'expired' | 'revoked';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          vip_level?: number;
          verified_by?: string | null;
          verification_date?: string;
          expiry_date?: string | null;
          status?: 'active' | 'expired' | 'revoked';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          vip_level?: number;
          verified_by?: string | null;
          verification_date?: string;
          expiry_date?: string | null;
          status?: 'active' | 'expired' | 'revoked';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: 'deposit' | 'withdrawal';
          amount: number;
          status: 'pending' | 'completed' | 'failed';
          payment_method: string | null;
          reference_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'deposit' | 'withdrawal';
          amount: number;
          status?: 'pending' | 'completed' | 'failed';
          payment_method?: string | null;
          reference_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'deposit' | 'withdrawal';
          amount?: number;
          status?: 'pending' | 'completed' | 'failed';
          payment_method?: string | null;
          reference_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          order_name: string;
          order_type: string;
          amount: number;
          description: string | null;
          status: 'pending' | 'completed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          order_name: string;
          order_type: string;
          amount: number;
          description?: string | null;
          status?: 'pending' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          order_name?: string;
          order_type?: string;
          amount?: number;
          description?: string | null;
          status?: 'pending' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
      };
      withdrawal_requests: {
        Row: {
          id: string;
          user_id: string;
          transaction_id: string;
          country: string;
          bank_name: string;
          account_name: string;
          account_number: string;
          amount: number;
          status: 'pending' | 'approved' | 'rejected' | 'completed';
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          transaction_id: string;
          country: string;
          bank_name: string;
          account_name: string;
          account_number: string;
          amount: number;
          status?: 'pending' | 'approved' | 'rejected' | 'completed';
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          transaction_id?: string;
          country?: string;
          bank_name?: string;
          account_name?: string;
          account_number?: string;
          amount?: number;
          status?: 'pending' | 'approved' | 'rejected' | 'completed';
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
        };
      };
    };
  };
};