import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';

export const useRealTimeUser = (userId: string | null) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    // Fetch initial user data
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;

        const userProfile: User = {
          id: data.id,
          username: data.username,
          phone: data.phone,
          firstName: data.first_name,
          lastName: data.last_name,
          balance: data.balance,
          isVip: data.is_vip,
          avatar: data.avatar,
          country: data.country,
          currency: data.currency,
          currencySymbol: data.currency_symbol,
          referralCode: data.referral_code,
          vipLevel: data.vip_level,
          vipVerificationId: data.vip_verification_id
        };

        setUser(userProfile);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();

    // Set up real-time subscription
    const subscription = supabase
      .channel('user-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`
        },
        (payload) => {
          const updatedData = payload.new;
          const updatedUser: User = {
            id: updatedData.id,
            username: updatedData.username,
            phone: updatedData.phone,
            firstName: updatedData.first_name,
            lastName: updatedData.last_name,
            balance: updatedData.balance,
            isVip: updatedData.is_vip,
            avatar: updatedData.avatar,
            country: updatedData.country,
            currency: updatedData.currency,
            currencySymbol: updatedData.currency_symbol,
            referralCode: updatedData.referral_code,
            vipLevel: updatedData.vip_level,
            vipVerificationId: updatedData.vip_verification_id
          };
          setUser(updatedUser);
          
          // Trigger a visual update animation
          const balanceElements = document.querySelectorAll('[data-balance-display]');
          balanceElements.forEach(element => {
            element.classList.add('animate-pulse');
            setTimeout(() => {
              element.classList.remove('animate-pulse');
            }, 1000);
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const updateUser = async (updates: Partial<User>) => {
    if (!userId) return;

    try {
      const dbUpdates: any = {};
      if (updates.firstName) dbUpdates.first_name = updates.firstName;
      if (updates.lastName) dbUpdates.last_name = updates.lastName;
      if (updates.phone) dbUpdates.phone = updates.phone;
      if (updates.avatar) dbUpdates.avatar = updates.avatar;
      if (updates.balance !== undefined) dbUpdates.balance = updates.balance;

      const { error } = await supabase
        .from('users')
        .update(dbUpdates)
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  return { user, isLoading, updateUser };
};