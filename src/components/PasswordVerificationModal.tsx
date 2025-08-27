import React, { useState } from 'react';
import { X, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

interface PasswordVerificationModalProps {
  userId: string;
  onClose: () => void;
  onVerified: () => void;
  title?: string;
  message?: string;
  useWithdrawalPassword?: boolean;
}

export const PasswordVerificationModal: React.FC<PasswordVerificationModalProps> = ({ 
  userId, 
  onClose, 
  onVerified,
  title = 'Verify Password',
  message = 'Please enter your password to continue',
  useWithdrawalPassword = false
}) => {
  const { t } = useLanguage();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);

    try {
      // Verify password against user's stored password (login or withdrawal)
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select(useWithdrawalPassword ? 'withdrawal_password' : 'password')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;

      const storedPassword = useWithdrawalPassword ? userData.withdrawal_password : userData.password;
      
      if (!storedPassword) {
        setError(useWithdrawalPassword ? t('auth.noWithdrawalPasswordSetMessage') : 'No login password found.');
        setIsVerifying(false);
        return;
      }
      
      if (storedPassword !== password) {
        setError(t('auth.incorrectPassword'));
        setIsVerifying(false);
        return;
      }

      // Password is correct
      onVerified();
    } catch (error) {
      console.error('Password verification error:', error);
      setError(t('common.error'));
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            {useWithdrawalPassword ? t('auth.verifyWithdrawalPasswordTitle') : title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          {useWithdrawalPassword ? t('auth.pleaseEnterWithdrawalPassword') : message}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {useWithdrawalPassword ? t('auth.withdrawalPasswordLabel') : t('auth.password')}
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-900 bg-white"
                placeholder={useWithdrawalPassword ? t('auth.enterWithdrawalPassword') : t('auth.enterPassword')}
                required
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              {t('auth.cancelar')}
            </button>
            <button
              type="submit"
              disabled={isVerifying || !password}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? t('auth.verifying') : t('auth.verificar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};