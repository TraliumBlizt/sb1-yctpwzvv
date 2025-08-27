import React, { useState } from 'react';
import { ArrowLeft, Camera, User, Phone, Save, Check, Lock, Building2, Share2, Globe } from 'lucide-react';
import { useRealTimeUser } from '../hooks/useRealTimeUser';
import { useLanguage } from '../contexts/LanguageContext';
import { PasswordChangeModal } from './PasswordChangeModal';
import { WithdrawalPasswordModal } from './WithdrawalPasswordModal';
import { BankAccountModal } from './BankAccountModal';
import { ReferralModal } from './ReferralModal';
import { LanguageSelector } from './LanguageSelector';

interface ProfileEditPageProps {
  userId: string;
  onBack: () => void;
}

const predefinedAvatars = [
  'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
  'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
  'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
  'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
  'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
  'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
  'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
];

export const ProfileEditPage: React.FC<ProfileEditPageProps> = ({ userId, onBack }) => {
  const { user, isLoading, updateUser } = useRealTimeUser(userId);
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showWithdrawalPasswordModal, setShowWithdrawalPasswordModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    avatar: ''
  });

  React.useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatar: user.avatar || predefinedAvatars[0]
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      await updateUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        avatar: formData.avatar
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarSelect = (avatarUrl: string) => {
    setFormData(prev => ({ ...prev, avatar: avatarUrl }));
    setShowAvatarSelector(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">User not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white px-6 pt-12 pb-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Edit Profile</h1>
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={isSaving}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors mr-4"
          >
            {isSaving ? (
              <div className="w-6 h-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : isEditing ? (
              <Save className="w-6 h-6" />
            ) : (
              <User className="w-6 h-6" />
            )}
          </button>
          <LanguageSelector />
        </div>

        {/* Avatar Section */}
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-white/20">
              <img
                src={formData.avatar || predefinedAvatars[0]}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            {isEditing && (
              <button
                onClick={() => setShowAvatarSelector(true)}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
          <h2 className="text-xl font-bold">{user.firstName} {user.lastName}</h2>
          <p className="text-white/80">ID: {user.username}</p>
        </div>
      </div>

      {/* Form */}
      <div className="px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('profile.firstName')}
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                disabled={!isEditing}
                className={`w-full pl-12 pr-4 py-3 border rounded-xl transition-colors ${
                  isEditing 
                    ? 'border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500' 
                    : 'border-gray-200 bg-gray-50'
                }`}
                placeholder={t('profile.firstName')}
              />
            </div>
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('profile.lastName')}
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                disabled={!isEditing}
                className={`w-full pl-12 pr-4 py-3 border rounded-xl transition-colors ${
                  isEditing 
                    ? 'border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500' 
                    : 'border-gray-200 bg-gray-50'
                }`}
                placeholder={t('profile.lastName')}
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('profile.phoneNumber')}
            </label>
            <div className="relative">
              <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                disabled={!isEditing}
                className={`w-full pl-12 pr-4 py-3 border rounded-xl transition-colors ${
                  isEditing 
                    ? 'border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500' 
                    : 'border-gray-200 bg-gray-50'
                }`}
                placeholder={t('profile.phoneNumber')}
              />
            </div>
          </div>

          {/* Account Info */}
          <div className="pt-4 border-t border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-4">{t('profile.accountInformation')}</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('profile.username')}:</span>
                <span className="font-medium">{user.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('profile.country')}:</span>
                <span className="font-medium">{user.country}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('profile.currency')}:</span>
                <span className="font-medium">{user.currency} ({user.currencySymbol})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('profile.vipStatus')}:</span>
                <span className={`font-medium ${user.isVip ? 'text-yellow-600' : 'text-gray-500'}`}>
                  {user.isVip ? t('profile.vipMember') : t('profile.regularMember')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="flex flex-col items-center p-4 bg-white rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Lock className="w-6 h-6 mb-2 text-yellow-600" />
            <span className="text-sm font-medium text-center text-gray-800">{t('auth.loginPassword')}</span>
          </button>
          <button
            onClick={() => setShowWithdrawalPasswordModal(true)}
            className="flex flex-col items-center p-4 bg-white rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Lock className="w-6 h-6 mb-2 text-yellow-600" />
            <span className="text-sm font-medium text-center text-gray-800">{t('auth.withdrawalPassword')}</span>
          </button>
          <button
            onClick={() => setShowBankModal(true)}
            className="flex flex-col items-center p-4 bg-white rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Building2 className="w-6 h-6 mb-2 text-yellow-600" />
            <span className="text-sm font-medium text-gray-800">{t('profile.bankAccount')}</span>
          </button>
        </div>

        {/* Second row for referral */}
        <div className="mt-4 grid grid-cols-1 gap-4">
          <div className="flex justify-center">
            <button
              onClick={() => setShowReferralModal(true)}
              className="flex flex-col items-center p-4 bg-white rounded-xl hover:bg-gray-50 transition-colors w-1/3 shadow-sm"
            >
              <Share2 className="w-6 h-6 mb-2 text-yellow-600" />
              <span className="text-sm font-medium text-gray-800">{t('profile.invite')}</span>
            </button>
          </div>
        </div>
        {/* Save Button */}
        {isEditing && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full mt-6 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      {/* Avatar Selector Modal */}
      {showAvatarSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Choose Avatar</h3>
            <div className="grid grid-cols-4 gap-3 mb-6">
              {predefinedAvatars.map((avatar, index) => (
                <button
                  key={index}
                  onClick={() => handleAvatarSelect(avatar)}
                  className={`w-16 h-16 rounded-full overflow-hidden border-2 transition-colors ${
                    formData.avatar === avatar ? 'border-yellow-500' : 'border-gray-200'
                  }`}
                >
                  <img src={avatar} alt={`Avatar ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAvatarSelector(false)}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showPasswordModal && (
        <PasswordChangeModal
          userId={userId}
          onClose={() => setShowPasswordModal(false)}
        />
      )}

      {showWithdrawalPasswordModal && (
        <WithdrawalPasswordModal
          userId={userId}
          onClose={() => setShowWithdrawalPasswordModal(false)}
        />
      )}

      {showBankModal && user && (
        <BankAccountModal
          userId={userId}
          userCountry={user.country || 'Colombia'}
          onClose={() => setShowBankModal(false)}
        />
      )}

      {showReferralModal && user && (
        <ReferralModal
          userId={userId}
          userReferralCode={user.referralCode || ''}
          onClose={() => setShowReferralModal(false)}
        />
      )}
    </div>
  );
};