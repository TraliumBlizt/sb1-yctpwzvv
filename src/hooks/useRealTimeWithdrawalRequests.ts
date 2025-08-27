import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface WithdrawalRequest {
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
}

export const useRealTimeWithdrawalRequests = (userId: string | null) => {
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setWithdrawalRequests([]);
      setIsLoading(false);
      return;
    }

    // Fetch initial withdrawal requests
    const fetchWithdrawalRequests = async () => {
      try {
        const { data, error } = await supabase
          .from('withdrawal_requests')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setWithdrawalRequests(data || []);
      } catch (error) {
        console.error('Error fetching withdrawal requests:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWithdrawalRequests();

    // Set up real-time subscription
    const subscription = supabase
      .channel('withdrawal-request-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'withdrawal_requests',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newRequest = payload.new as WithdrawalRequest;
            setWithdrawalRequests(prev => [newRequest, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedRequest = payload.new as WithdrawalRequest;
            setWithdrawalRequests(prev => 
              prev.map(request => request.id === updatedRequest.id ? updatedRequest : request)
            );
          } else if (payload.eventType === 'DELETE') {
            setWithdrawalRequests(prev => 
              prev.filter(request => request.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  return { withdrawalRequests, isLoading };
};