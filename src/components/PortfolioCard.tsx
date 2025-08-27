import React from 'react';
import { useState } from 'react';
import { Stats } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { PasswordVerificationModal } from './PasswordVerificationModal';

interface PortfolioCardProps {
  balance: number;
  stats: Stats;
  currencySymbol?: string;
  onDeposit: () => void;
  onWithdrawal: () => void;
  canWithdraw?: boolean;
  withdrawalMessage?: string;
  userId?: string;
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({ 
  balance, 
  stats, 
  currencySymbol = '$', 
  onDeposit, 
  onWithdrawal,
  canWithdraw = true,
  withdrawalMessage,
  userId
}) => {
  const { t } = useLanguage();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleWithdrawalClick = () => {
    if (canWithdraw && userId) {
      setShowPasswordModal(true);
    }
  };

  const handlePasswordVerified = () => {
    setShowPasswordModal(false);
    onWithdrawal();
  };
  
  return (
    <>
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6">
      <p className="text-white/80 text-sm mb-2">{t('dashboard.portfolioBalance')}</p>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h3 
          className="text-2xl sm:text-3xl font-bold text-white break-all transition-all duration-700 transform hover:scale-105"
          data-balance-display
        >
          {currencySymbol}{balance.toFixed(2)}
        </h3>
        <div className="flex space-x-2 sm:space-x-3">
          <button 
            onClick={onDeposit}
            className="bg-white text-yellow-600 px-3 sm:px-4 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors text-sm sm:text-base"
          >
            {t('dashboard.deposit')}
          </button>
          <button 
            onClick={handleWithdrawalClick}
            disabled={!canWithdraw}
            className={`px-3 sm:px-4 py-2 rounded-full font-semibold transition-colors text-sm sm:text-base ${
              canWithdraw 
                ? 'bg-white/20 text-white hover:bg-white/30' 
                : 'bg-gray-400/50 text-gray-300 cursor-not-allowed'
            }`}
            title={!canWithdraw ? withdrawalMessage : undefined}
          >
            {t('dashboard.withdrawal')}
          </button>
        </div>
      </div>
      
      {!canWithdraw && withdrawalMessage && (
        <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-400/30 rounded-xl">
          <p className="text-yellow-100 text-sm text-center">
            {withdrawalMessage}
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-white/80 text-xs mb-1 truncate">{t('dashboard.yesterday')}</p>
          <p className="text-white font-semibold text-sm sm:text-base break-all">{currencySymbol}{stats.yesterday.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-white/80 text-xs mb-1 truncate">{t('dashboard.accumulated')}</p>
          <p className="text-white font-semibold text-sm sm:text-base break-all">{currencySymbol}{stats.accumulated.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-white/80 text-xs mb-1 truncate">{t('dashboard.today')}</p>
          <p className="text-white font-semibold text-sm sm:text-base break-all">{currencySymbol}{stats.today.toFixed(2)}</p>
        </div>
      </div>
      </div>

      {/* Password Verification Modal */}
      {showPasswordModal && userId && (
        <PasswordVerificationModal
          userId={userId}
          onClose={() => setShowPasswordModal(false)}
          onVerified={handlePasswordVerified}
          title="Verify Withdrawal Password"
          message="Please enter your withdrawal password to proceed with withdrawal"
          useWithdrawalPassword={true}
        />
      )}
    </>
  );
};