import React from 'react';
import { useState } from 'react';
import { User } from '../types';
import { CreditCard, RefreshCw, DollarSign, Info, Share2, LogOut, Edit } from 'lucide-react';
import { ReferralModal } from './ReferralModal';
import { VipStatusCard } from './VipStatusCard';
import { useLanguage } from '../contexts/LanguageContext';
import { useRealTimeUser } from '../hooks/useRealTimeUser';

interface ProfilePageProps {
  user: User;
  onLogout: () => void;
  onNavigate: (page: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onLogout, onNavigate }) => {
  const { t } = useLanguage();
  const [showReferralModal, setShowReferralModal] = useState(false);
  
  // Use real-time user data for live balance updates
  const { user: realTimeUser } = useRealTimeUser(user.id);
  const currentUser = realTimeUser || user;

  const menuItems = [
    { icon: CreditCard, title: t('profile.accountingDetails'), color: 'text-yellow-500', action: 'accounting' },
    { icon: RefreshCw, title: t('profile.depositRecords'), color: 'text-yellow-500', action: 'deposits' },
    { icon: DollarSign, title: t('profile.withdrawalRecords'), color: 'text-yellow-500', action: 'withdrawal-requests' },
    { icon: Info, title: t('profile.aboutUs'), color: 'text-yellow-500', action: 'about' },
    { icon: Share2, title: t('profile.inviteFriends'), color: 'text-yellow-500', action: 'invite' },
  ];

  const handleMenuItemClick = (action: string) => {
    if (action === 'invite') {
      setShowReferralModal(true);
    } else {
      onNavigate(action);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white px-6 pt-12 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-full overflow-hidden">
              <img
                src={
                  user.avatar ||
                  'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
                }
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold truncate">
                {currentUser.firstName} {currentUser.lastName}
              </h2>
              <div className="text-white/80 text-xs sm:text-sm space-y-1">
                <p className="truncate">ID: {currentUser.username}</p>
                <p className="truncate">Phone: {currentUser.phone}</p>
              </div>
            </div>
          </div>
          <button
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex-shrink-0"
            onClick={() => onNavigate('edit-profile')}
          >
            <Edit className="w-5 h-5" />
          </button>
        </div>

        {/* Balance Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-white/80 text-sm mb-2">{t('dashboard.portfolioBalance')}:</p>
              <h3 
                className="text-2xl sm:text-3xl font-bold text-white break-all transition-all duration-700 transform hover:scale-105"
                data-balance-display
              >
                {currentUser.currencySymbol || '$'}
                {currentUser.balance.toFixed(2)}
              </h3>
            </div>
            
          </div>
        </div>
      </div>

      {/* VIP Status Section */}
      <div className="px-6 py-4">
        <VipStatusCard userId={currentUser.id} />
      </div>

      {/* Menu Items */}
      <div className="px-6 py-6 pb-32"> {/* 👈 Bottom padding added to avoid being hidden by navbar */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleMenuItemClick(item.action)}
              className="w-full flex items-center justify-between p-6 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center">
                  <item.icon className={`w-6 h-6 ${item.color}`} /> 
                </div>
                <span className="font-medium text-gray-800">{item.title}</span>
              </div>
              
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full mt-6 flex items-center justify-center space-x-2 bg-red-500 text-white py-4 rounded-2xl font-semibold hover:bg-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>{t('auth.signOut')}</span>
        </button>
      </div>

      {/* Referral Modal */}
      {showReferralModal && (
        <ReferralModal
          userId={user.id}
          userReferralCode={user.referralCode || ''}
          onClose={() => setShowReferralModal(false)}
        />
      )}
    </div>
  );
};
