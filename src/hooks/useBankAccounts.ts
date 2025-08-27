import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface BankAccount {
  id: string;
  user_id: string;
  country: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  account_type: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export const useBankAccounts = (userId: string | null) => {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setBankAccounts([]);
      setIsLoading(false);
      return;
    }

    // Fetch initial bank accounts
    const fetchBankAccounts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('bank_accounts')
          .select('*')
          .eq('user_id', userId)
          .order('is_primary', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBankAccounts(data || []);
      } catch (err) {
        console.error('Error fetching bank accounts:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch bank accounts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBankAccounts();

    // Set up real-time subscription
    const subscription = supabase
      .channel('bank-accounts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bank_accounts',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newAccount = payload.new as BankAccount;
            setBankAccounts(prev => [newAccount, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedAccount = payload.new as BankAccount;
            setBankAccounts(prev => 
              prev.map(account => account.id === updatedAccount.id ? updatedAccount : account)
            );
          } else if (payload.eventType === 'DELETE') {
            setBankAccounts(prev => 
              prev.filter(account => account.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const getPrimaryAccount = () => {
    return bankAccounts.find(account => account.is_primary) || bankAccounts[0] || null;
  };

  const getAccountsByCountry = (country: string) => {
    return bankAccounts.filter(account => account.country === country);
  };

  return {
    bankAccounts,
    isLoading,
    error,
    getPrimaryAccount,
    getAccountsByCountry
  };
};