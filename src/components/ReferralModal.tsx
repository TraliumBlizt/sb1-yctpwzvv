import React, { useState, useEffect } from 'react';
import { X, Share2, Copy, Users, DollarSign, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

interface InvitationData {
  referral_count: number;
  invitation_count: number;
  total_earnings: number;
  pending_earnings: number;
  recent_invitations: Array<{
    referred_user: string;
    created_at: string;
    status: string;
    reward_amount: number;
  }>;
}

interface ReferralModalProps {
  userId: string;
  userReferralCode: string;
  onClose: () => void;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({ 
  userId, 
  userReferralCode, 
  onClose 
}) => {
  const { t } = useLanguage();
  const [invitationData, setInvitationData] = useState<InvitationData>({
    referral_count: 0,
    invitation_count: 0,
    total_earnings: 0,
    pending_earnings: 0,
    recent_invitations: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const referralLink = `${window.location.origin}?ref=${userReferralCode}`;

  useEffect(() => {
    fetchInvitationData();
  }, [userId]);

  const fetchInvitationData = async () => {
    try {
      // Fetch invitation statistics
      const { data: invitations, error: invitationsError } = await supabase
        .from('invitations')
        .select(`
          *,
          invited:invited_id(first_name, last_name, username),
          inviter:inviter_id(first_name, last_name, username)
        `)
        .eq('inviter_id', userId);

      if (invitationsError) throw invitationsError;

      // Also fetch legacy referrals for backward compatibility
      const { data: referrals, error: referralsError } = await supabase
        .from('referrals')
        .select(`
          *,
          referred:referred_id(first_name, last_name, username),
          referrer:referrer_id(first_name, last_name, username)
        `)
        .eq('referrer_id', userId);

      if (referralsError) throw referralsError;

      const invitationEarnings = invitations
        ?.filter(i => i.status === 'completed')
        .reduce((sum, i) => sum + i.reward_amount, 0) || 0;

      const pendingInvitationEarnings = invitations
        ?.filter(i => i.status === 'pending')
        .reduce((sum, i) => sum + i.reward_amount, 0) || 0;

      const totalEarnings = referrals
        ?.filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + r.reward_amount, 0) || 0;

      const pendingEarnings = referrals
        ?.filter(r => r.status === 'pending')
        .reduce((sum, r) => sum + r.reward_amount, 0) || 0;

      const combinedTotalEarnings = totalEarnings + invitationEarnings;
      const combinedPendingEarnings = pendingEarnings + pendingInvitationEarnings;

      const recentReferrals = referrals
        ?.slice(0, 5)
        .map(r => ({
          referred_user: r.referred?.username || 'Unknown',
          created_at: r.created_at,
          status: r.status,
          reward_amount: r.reward_amount
        })) || [];

      const recentInvitations = invitations
        ?.slice(0, 5)
        .map(i => ({
          referred_user: i.invited?.username || 'Unknown',
          created_at: i.created_at,
          status: i.status,
          reward_amount: i.reward_amount
        })) || [];

      const combinedRecent = [...recentInvitations, ...recentReferrals]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

      setInvitationData({
        referral_count: referrals?.length || 0,
        invitation_count: invitations?.length || 0,
        total_earnings: combinedTotalEarnings,
        pending_earnings: combinedPendingEarnings,
        recent_invitations: combinedRecent
      });
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Set up real-time subscription for referral updates
  useEffect(() => {
    if (!userId) return;

    const subscription = supabase
      .channel('invitation-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'referrals',
          filter: `referrer_id=eq.${userId}`
        },
        () => {
          // Refetch data when referrals change
          fetchInvitationData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invitations',
          filter: `inviter_id=eq.${userId}`
        },
        () => {
          fetchInvitationData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareReferralLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Financial Platform',
          text: 'Join me on this amazing financial platform!',
          url: referralLink
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      copyToClipboard(referralLink);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">{t('referral.title')}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Referral Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="text-2xl font-bold text-blue-600">{invitationData.invitation_count + invitationData.referral_count}</h4>
                <p className="text-sm text-blue-700">{t('referral.totalInvitations')}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="text-2xl font-bold text-green-600">${invitationData.total_earnings.toFixed(2)}</h4>
                <p className="text-sm text-green-700">{t('referral.totalEarned')}</p>
              </div>
            </div>

            {/* Pending Earnings */}
            {invitationData.pending_earnings > 0 && (
              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-semibold text-yellow-800">{t('referral.pendingEarnings')}</h5>
                    <p className="text-sm text-yellow-700">{t('referral.pendingEarningsDesc')}</p>
                  </div>
                  <span className="text-xl font-bold text-yellow-600">
                    ${invitationData.pending_earnings.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Referral Code */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h5 className="font-semibold text-gray-800 mb-3">{t('referral.yourReferralCode')}</h5>
              <div className="flex items-center justify-between bg-white rounded-lg p-3 border">
                <span className="font-mono text-lg font-bold text-yellow-600">{userReferralCode}</span>
                <button
                  onClick={() => copyToClipboard(userReferralCode)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  {copied ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Referral Link */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h5 className="font-semibold text-gray-800 mb-3">{t('referral.referralLink')}</h5>
              <div className="bg-white rounded-lg p-3 border mb-3">
                <p className="text-sm text-gray-600 break-all">{referralLink}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(referralLink)}
                  className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span>{t('referral.copyLink')}</span>
                </button>
                <button
                  onClick={shareReferralLink}
                  className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{t('referral.share')}</span>
                </button>
              </div>
            </div>

            {/* How it Works */}
            <div className="bg-blue-50 rounded-xl p-4">
              <h5 className="font-semibold text-blue-800 mb-3">{t('referral.howItWorks')}</h5>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                  <p>{t('referral.step1')}</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                  <p>{t('referral.step2')}</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                  <p>{t('referral.step3')}</p>
                </div>
              </div>
            </div>

            {/* Recent Invitations */}
            {invitationData.recent_invitations.length > 0 && (
              <div>
                <h5 className="font-semibold text-gray-800 mb-3">{t('referral.recentInvitations')}</h5>
                <div className="space-y-2">
                  {invitationData.recent_invitations.map((invitation, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{invitation.referred_user}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(invitation.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          invitation.status === 'completed' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {invitation.status === 'completed' ? t('referral.completed') : t('referral.pending')}
                        </span>
                        <p className="text-sm font-semibold text-gray-600 mt-1">
                          ${invitation.reward_amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};