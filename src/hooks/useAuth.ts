import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = () => {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setIsLoading(false);
    };

    checkSession();
  }, []);

  const login = useCallback(async (phone: string, password: string) => {
    setIsLoading(true);
    try {
      // Query the users table directly for authentication
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .single();

      if (error || !data) {
        throw new Error('Invalid phone number or user not found');
      }

      // For demo purposes, we'll use a simple password check
      // In production, you should hash passwords
      if (data.password !== password) {
        throw new Error('Invalid password');
      }

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
        currencySymbol: data.currency_symbol
      };

      setUser(userProfile);
      localStorage.setItem('currentUser', JSON.stringify(userProfile));

      return userProfile;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (userData: {
    countryCode: string;
    phone: string;
    password: string;
    firstName: string;
    lastName: string;
    inviteCode?: string;
    country: string;
    currency: string;
    currencySymbol: string;
  }) => {
    setIsLoading(true);
    try {
      const fullPhone = `${userData.countryCode}${userData.phone}`;
      const username = 'TT' + Date.now().toString().slice(-6);
      
      // Check if phone number already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('phone')
        .eq('phone', fullPhone)
        .single();

      if (existingUser) {
        throw new Error('Phone number already registered');
      }

      // Validate referral code is required and exists
      let referredBy = null;
      
      // Required invitation code processing
      if (!userData.inviteCode?.trim()) {
        throw new Error('Invitation code is required');
      }

      // Validate invitation code
      const { data: validationData, error: validationError } = await supabase.rpc('validate_invitation_code', {
        p_invitation_code: userData.inviteCode.trim()
      });

      if (validationError) throw validationError;

      if (!validationData || validationData.length === 0 || !validationData[0].is_valid) {
        throw new Error('Invalid invitation code');
      }

      referredBy = validationData[0].inviter_id;

      // Double-check by querying users table directly
      if (referredBy) {
        const { data: referrerData, error: referrerError } = await supabase
          .from('users')
          .select('id, username, referral_code')
          .eq('id', referredBy)
          .single();

        if (referrerError || !referrerData) {
          throw new Error('Invalid invitation code - referrer not found');
        }
      }

      // Create user profile directly in the users table
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: crypto.randomUUID(), // Generate a UUID for the user
          username,
          phone: fullPhone,
          password: userData.password, // In production, hash this password
          first_name: userData.firstName || 'User',
          last_name: userData.lastName || username.slice(-4),
          balance: 0.00,
          is_vip: false,
          avatar: `https://api.dicebear.com/7.x/thumbs/svg?seed=${username}`,
          country: userData.country,
          currency: userData.currency,
          currency_symbol: userData.currencySymbol,
          referred_by: referredBy
        })
        .select()
        .single();

      if (error) throw error;

      // Create invitation relationship
      if (referredBy) {
        const { error: invitationError } = await supabase
          .from('invitations')
          .insert({
            inviter_id: referredBy,
            invited_id: data.id,
            invitation_code: userData.inviteCode.trim(),
            status: 'pending'
          });

        if (invitationError) {
          console.error('Error creating invitation relationship:', invitationError);
          // Don't throw error here as user is already created
        }

        // Also create referral record for backward compatibility
        const { error: referralError } = await supabase
          .from('referrals')
          .insert({
            referrer_id: referredBy,
            referred_id: data.id,
            referral_code: userData.inviteCode.trim(),
            status: 'pending'
          });

        if (referralError) {
          console.error('Error creating referral relationship:', referralError);
          // Don't throw error here as user is already created
        }
      } else {
        // This should not happen due to validation above, but just in case
        const { error: deleteError } = await supabase
          .from('users')
          .delete()
          .eq('id', data.id);
        
        if (deleteError) {
          console.error('Error cleaning up user after invitation validation failed:', deleteError);
        }
        
        throw new Error('Failed to process invitation code');
      }

      // Create initial referral relationship using the old method for compatibility
      if (referredBy && userData.inviteCode?.trim()) {
        const { error: legacyReferralError } = await supabase.rpc('create_referral_relationship', {
          p_referral_code: userData.inviteCode.trim(),
          p_referred_user_id: data.id
        });

        if (legacyReferralError) {
          console.error('Error creating legacy referral relationship:', legacyReferralError);
          // Don't throw error here as user is already created
        }
      }

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
        currencySymbol: data.currency_symbol
      };

      setUser(userProfile);
      localStorage.setItem('currentUser', JSON.stringify(userProfile));

      return userProfile;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  }, []);

  const updateBalance = useCallback(async (newBalance: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;

      const updatedUser = { ...user, balance: newBalance };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error updating balance:', error);
      throw error;
    }
  }, [user]);

  return {
    user,
    login,
    register,
    logout,
    updateBalance,
    isLoading
  };
};