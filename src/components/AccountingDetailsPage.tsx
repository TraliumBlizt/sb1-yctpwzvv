import React from 'react';
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { useRealTimeUser } from '../hooks/useRealTimeUser';
import { useRealTimeTransactions } from '../hooks/useRealTimeTransactions';
import { useLanguage } from '../contexts/LanguageContext';

interface AccountingDetailsPageProps {
  userId: string;
  onBack: () => void;
}

export const AccountingDetailsPage: React.FC<AccountingDetailsPageProps> = ({ userId, onBack }) => {
  const { t } = useLanguage();
  const { user, isLoading: userLoading } = useRealTimeUser(userId);
  const { transactions, isLoading: transactionsLoading } = useRealTimeTransactions(userId);

  const calculateStats = () => {
    // Separate actual deposits from commissions for accurate accounting
    const actualDeposits = transactions.filter(t => 
      t.type === 'deposit' && 
      t.status === 'completed' && 
      t.payment_method !== 'commission'
    );
    const commissions = transactions.filter(t => 
      t.type === 'deposit' && 
      t.status === 'completed' && 
      t.payment_method === 'commission'
    );
    const withdrawals = transactions.filter(t => t.type === 'withdrawal' && t.status === 'completed');
    
    const totalActualDeposits = actualDeposits.reduce((sum, t) => sum + t.amount, 0);
    const totalCommissions = commissions.reduce((sum, t) => sum + t.amount, 0);
    const totalDeposits = totalActualDeposits + totalCommissions; // Combined for net balance calculation
    const totalWithdrawals = withdrawals.reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate this month's transactions
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonthActualDeposits = actualDeposits.filter(t => {
      const date = new Date(t.created_at);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).reduce((sum, t) => sum + t.amount, 0);
    
    const thisMonthCommissions = commissions.filter(t => {
      const date = new Date(t.created_at);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).reduce((sum, t) => sum + t.amount, 0);
    
    const thisMonthDeposits = thisMonthActualDeposits + thisMonthCommissions;
    
    const thisMonthWithdrawals = withdrawals.filter(t => {
      const date = new Date(t.created_at);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).reduce((sum, t) => sum + t.amount, 0);

    return {
      totalDeposits,
      totalActualDeposits,
      totalCommissions,
      totalWithdrawals,
      thisMonthDeposits,
      thisMonthActualDeposits,
      thisMonthCommissions,
      thisMonthWithdrawals,
      netBalance: totalDeposits - totalWithdrawals,
      transactionCount: transactions.length
    };
  };

  if (userLoading || transactionsLoading) {
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

  const stats = calculateStats();
  const currencySymbol = user.currencySymbol || '$';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white px-6 pt-12 pb-8">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors mr-4"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">{t('accounting.title')}</h1>
        </div>

        {/* Current Balance Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
          <div className="flex items-center mb-4">
            <Wallet className="w-8 h-8 mr-3" />
            <div>
              <p className="text-white/80 text-sm">{t('accounting.currentBalance')}</p>
              <h2 className="text-3xl font-bold">{currencySymbol}{user.balance.toFixed(2)}</h2>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/80">{t('accounting.lastUpdated')}: {new Date().toLocaleString()}</span>
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-8">
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Total Deposits */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-gray-500 text-sm mb-1">{t('accounting.totalEarnings')}</p>
            <h3 className="text-2xl font-bold text-green-600">{currencySymbol}{stats.totalDeposits.toFixed(2)}</h3>
            <div className="mt-2 text-xs text-gray-400">
              <p>{t('accounting.deposits')}: {currencySymbol}{stats.totalActualDeposits.toFixed(2)}</p>
              <p>{t('accounting.commissions')}: {currencySymbol}{stats.totalCommissions.toFixed(2)}</p>
            </div>
          </div>

          {/* Total Withdrawals */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <p className="text-gray-500 text-sm mb-1">{t('accounting.totalWithdrawals')}</p>
            <h3 className="text-2xl font-bold text-red-600">{currencySymbol}{stats.totalWithdrawals.toFixed(2)}</h3>
          </div>
        </div>

        {/* Monthly Summary */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <div className="flex items-center mb-6">
            <Calendar className="w-6 h-6 text-yellow-600 mr-3" />
            <h3 className="text-lg font-bold text-gray-800">{t('accounting.thisMonth')}</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-600">{t('accounting.totalEarnings')}</span>
              </div>
              <span className="font-semibold text-green-600">{currencySymbol}{stats.thisMonthDeposits.toFixed(2)}</span>
            </div>
            
            <div className="ml-6 space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">• {t('accounting.deposits')}</span>
                <span className="font-medium text-green-600">{currencySymbol}{stats.thisMonthActualDeposits.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">• {t('accounting.commissions')}</span>
                <span className="font-medium text-green-600">{currencySymbol}{stats.thisMonthCommissions.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <span className="text-gray-600">{t('accounting.withdrawals')}</span>
              </div>
              <span className="font-semibold text-red-600">{currencySymbol}{stats.thisMonthWithdrawals.toFixed(2)}</span>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-800">{t('accounting.netThisMonth')}</span>
                <span className={`font-bold text-lg ${
                  (stats.thisMonthDeposits - stats.thisMonthWithdrawals) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {currencySymbol}{(stats.thisMonthDeposits - stats.thisMonthWithdrawals).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Summary */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center mb-6">
            <DollarSign className="w-6 h-6 text-yellow-600 mr-3" />
            <h3 className="text-lg font-bold text-gray-800">{t('accounting.accountSummary')}</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">{t('accounting.accountType')}</span>
              <span className="font-semibold">{user.isVip ? t('profile.vipMember') : t('profile.regularMember')}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">{t('accounting.totalTransactions')}</span>
              <span className="font-semibold">{stats.transactionCount}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">{t('accounting.netBalance')}</span>
              <span className={`font-semibold ${stats.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {currencySymbol}{stats.netBalance.toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">{t('accounting.currency')}</span>
              <span className="font-semibold">{user.currency} ({currencySymbol})</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">{t('accounting.country')}</span>
              <span className="font-semibold">{user.country}</span>
            </div>
          </div>
        </div>

        {/* Real-time Indicator */}
        <div className="mt-6 flex items-center justify-center">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>{t('accounting.realTimeSync')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};