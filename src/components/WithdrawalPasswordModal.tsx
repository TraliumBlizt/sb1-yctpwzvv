import React, { useState } from 'react';
import { X, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

interface WithdrawalPasswordModalProps {
  userId: string;
  onClose: () => void;
}

export const WithdrawalPasswordModal: React.FC<WithdrawalPasswordModalProps> = ({ userId, onClose }) => {
  const { t } = useLanguage();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);

  React.useEffect(() => {
    // Check if user already has a withdrawal password
    const checkExistingPassword = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('withdrawal_password')
          .eq('id', userId)
          .single();

        if (error) throw error;
        setIsFirstTime(!data.withdrawal_password);
      } catch (error) {
        console.error('Error checking withdrawal password:', error);
      }
    };

    checkExistingPassword();
  }, [userId]);

  const validatePassword = (password: string) => /^\d{6,22}$/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword(newPassword)) {
      alert('Withdrawal password must be 6-22 digits only');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    // If not first time, verify current withdrawal password
    if (!isFirstTime) {
      if (!currentPassword) {
        alert('Please enter your current withdrawal password');
        return;
      }

      try {
        const { data: userData, error: fetchError } = await supabase
          .from('users')
          .select('withdrawal_password')
          .eq('id', userId)
          .single();

        if (fetchError) throw fetchError;

        if (userData.withdrawal_password !== currentPassword) {
          alert('Current withdrawal password is incorrect');
          return;
        }
      } catch (error) {
        console.error('Withdrawal password verification error:', error);
        alert('Failed to verify current withdrawal password');
        return;
      }
    }

    setIsLoading(true);

    try {
      // Update withdrawal password
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          withdrawal_password: newPassword,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      setShowSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Withdrawal password change error:', error);
      alert('Failed to change withdrawal password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {isFirstTime ? 'Withdrawal Password Set!' : 'Withdrawal Password Changed!'}
          </h3>
          <p className="text-gray-600">
            {isFirstTime 
              ? 'Your withdrawal password has been set successfully.' 
              : 'Your withdrawal password has been updated successfully.'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            {isFirstTime ? t('auth.setWithdrawalPassword') : t('auth.changeWithdrawalPassword')}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Withdrawal Password - only show if not first time */}
          {!isFirstTime && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.currentWithdrawalPassword')}
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder={t('auth.enterCurrentWithdrawalPassword')}
                  required={!isFirstTime}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {/* New Withdrawal Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isFirstTime ? t('auth.withdrawalPassword') + ' (6-22 digits)' : t('auth.newWithdrawalPassword')}
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-500 transition-colors ${
                  newPassword && !validatePassword(newPassword)
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300 focus:border-yellow-500'
                }`}
                placeholder={isFirstTime ? t('auth.enterWithdrawalPassword') : t('auth.enterNewWithdrawalPassword')}
                pattern="\d{6,22}"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Withdrawal Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.confirmWithdrawalPassword')}
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-500 transition-colors ${
                  confirmPassword && newPassword !== confirmPassword
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300 focus:border-yellow-500'
                }`}
                placeholder={t('auth.confirmWithdrawalPasswordPlaceholder')}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              {t('general.cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword || (!isFirstTime && !currentPassword)}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t('auth.verifying') : (isFirstTime ? t('general.save') : t('general.save'))}
            </button>
          </div>
        </form>

        {/* Info */}
        <div className="mt-4 p-3 bg-blue-50 rounded-xl">
          <p className="text-sm text-blue-700">
            {isFirstTime ? t('auth.setWithdrawalPasswordInfo') : t('auth.withdrawalPasswordInfo')}
          </p>
        </div>
      </div>
    </div>
  );
};