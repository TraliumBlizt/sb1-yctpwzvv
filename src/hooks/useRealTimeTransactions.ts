import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Transaction {
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
}

export const useRealTimeTransactions = (userId: string | null, type?: 'deposit' | 'withdrawal', excludeCommissions: boolean = false) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    // Fetch initial transactions
    const fetchTransactions = async () => {
      try {
        let query = supabase
          .from('transactions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (type) {
          query = query.eq('type', type);
        }

        // Exclude commission transactions if requested
        if (excludeCommissions) {
          query = query.neq('payment_method', 'commission');
        }
        const { data, error } = await query;

        if (error) throw error;
        
        let filteredData = data || [];
        
        // Additional client-side filtering for commissions if needed
        if (excludeCommissions) {
          filteredData = filteredData.filter(t => t.payment_method !== 'commission');
        }
        
        setTransactions(filteredData);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();

    // Set up real-time subscription
    const subscription = supabase
      .channel('transaction-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newTransaction = payload.new as Transaction;
            if ((!type || newTransaction.type === type) && 
                (!excludeCommissions || newTransaction.payment_method !== 'commission')) {
              setTransactions(prev => [newTransaction, ...prev]);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedTransaction = payload.new as Transaction;
            if ((!type || updatedTransaction.type === type) && 
                (!excludeCommissions || updatedTransaction.payment_method !== 'commission')) {
              setTransactions(prev => 
                prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t)
              );
            } else if (excludeCommissions && updatedTransaction.payment_method === 'commission') {
              // Remove commission transactions that were updated to be commissions
              setTransactions(prev => prev.filter(t => t.id !== updatedTransaction.id));
            }
          } else if (payload.eventType === 'DELETE') {
            setTransactions(prev => 
              prev.filter(t => t.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, type, excludeCommissions]);

  const getPaymentMethodDisplay = (method: string | null) => {
    if (!method) return 'Unknown';
    
    const methodMap: { [key: string]: string } = {
      'card': 'Credit/Debit Card',
      'bank': 'Bank Transfer',
      'mobile': 'Mobile Payment',
      'kbz': 'KBZ Pay',
      'wave': 'Wave Money',
      'aya': 'AYA Pay',
      'commission': 'Commission', // This won't be shown due to filtering, but kept for completeness
      'balance_restoration': 'Balance Restoration'
    };
    
    return methodMap[method] || method;
  };

  return { transactions, isLoading };
};