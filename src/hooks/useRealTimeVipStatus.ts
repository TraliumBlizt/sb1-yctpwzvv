import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

export interface VipVerification {
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
}

export interface VipStatus {
  isVip: boolean;
  vipLevel: number;
  verification: VipVerification | null;
  isExpiringSoon: boolean;
  daysUntilExpiry: number | null;
}

export const useRealTimeVipStatus = (userId: string | null) => {
  const [vipStatus, setVipStatus] = useState<VipStatus>({
    isVip: false,
    vipLevel: 0,
    verification: null,
    isExpiringSoon: false,
    daysUntilExpiry: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setVipStatus({
        isVip: false,
        vipLevel: 0,
        verification: null,
        isExpiringSoon: false,
        daysUntilExpiry: null
      });
      setIsLoading(false);
      return;
    }

    // Fetch initial VIP status
    const fetchVipStatus = async () => {
      try {
        // Get user's current VIP info
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('is_vip, vip_level, vip_verification_id')
          .eq('id', userId)
          .single();

        if (userError) throw userError;

        let verification: VipVerification | null = null;
        let isExpiringSoon = false;
        let daysUntilExpiry: number | null = null;

        // If user has a VIP verification, get the details
        if (userData.vip_verification_id) {
          const { data: verificationData, error: verificationError } = await supabase
            .from('vip_verifications')
            .select('*')
            .eq('id', userData.vip_verification_id)
            .single();

          if (!verificationError && verificationData) {
            verification = verificationData;

            // Check if expiring soon (within 30 days)
            if (verification.expiry_date) {
              const expiryDate = new Date(verification.expiry_date);
              const now = new Date();
              const diffTime = expiryDate.getTime() - now.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              daysUntilExpiry = diffDays;
              isExpiringSoon = diffDays <= 30 && diffDays > 0;
            }
          }
        }

        setVipStatus({
          isVip: userData.is_vip || false,
          vipLevel: userData.vip_level || 0,
          verification,
          isExpiringSoon,
          daysUntilExpiry
        });
      } catch (error) {
        console.error('Error fetching VIP status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVipStatus();

    // Set up real-time subscription for user changes
    const userSubscription = supabase
      .channel('user-vip-changes')
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
          setVipStatus(prev => ({
            ...prev,
            isVip: updatedData.is_vip || false,
            vipLevel: updatedData.vip_level || 0
          }));
        }
      )
      .subscribe();

    // Set up real-time subscription for VIP verification changes
    const vipSubscription = supabase
      .channel('vip-verification-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vip_verifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          // Refetch VIP status when verifications change
          fetchVipStatus();
        }
      )
      .subscribe();

    return () => {
      userSubscription.unsubscribe();
      vipSubscription.unsubscribe();
    };
  }, [userId]);

  const getVipLevelName = (level: number): string => {
    switch (level) {
      case 1: return 'VIP1';
      case 2: return 'VIP2';
      case 3: return 'VIP3';
      case 4: return 'VIP4';
      default: return 'Regular';
    }
  };

  const getVipLevelColor = (level: number): string => {
    switch (level) {
      case 1: return 'bg-blue-500 text-white';
      case 2: return 'bg-purple-500 text-white';
      case 3: return 'bg-yellow-500 text-black';
      case 4: return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getVipBenefits = (level: number): string[] => {
    const { t } = useLanguage();
    const benefits: string[] = [];
    
    if (level >= 1) {
      benefits.push(t('vip.prioritySupport'));
      benefits.push(t('vip.reducedFees'));
    }
    if (level >= 2) {
      benefits.push(t('vip.higherLimits'));
      benefits.push(t('vip.exclusivePromotions'));
    }
    if (level >= 3) {
      benefits.push(t('vip.personalManager'));
      benefits.push(t('vip.advancedTools'));
    }
    if (level >= 4) {
      benefits.push(t('vip.premiumInvestments'));
      benefits.push(t('vip.vipEvents'));
      benefits.push(t('vip.customStrategies'));
    }
    
    return benefits;
  };

  return {
    vipStatus,
    isLoading,
    getVipLevelName,
    getVipLevelColor,
    getVipBenefits
  };
};