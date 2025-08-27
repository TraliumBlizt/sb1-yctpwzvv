import React from 'react';
import { ArrowLeft, ArrowDownCircle, Clock, CheckCircle, XCircle, Copy } from 'lucide-react';
import { useRealTimeUser } from '../hooks/useRealTimeUser';
import { useRealTimeTransactions } from '../hooks/useRealTimeTransactions';
import { useLanguage } from '../contexts/LanguageContext';

interface DepositRecordsPageProps {
  userId: string;
  onBack: () => void;
}

export const DepositRecordsPage: React.FC<DepositRecordsPageProps> = ({ userId, onBack }) => {
  const { t } = useLanguage();
  const { user, isLoading: userLoading } = useRealTimeUser(userId);
  const { transactions, isLoading: transactionsLoading } = useRealTimeTransactions(userId, 'deposit', true);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const copyReferenceId = (refId: string) => {
    navigator.clipboard.writeText(refId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getPaymentMethodDisplay = (method: string | null) => {
    if (!method) return 'Unknown';
    
    const methodMap: { [key: string]: string } = {
      'card': 'Credit/Debit Card',
      'bank': 'Bank Transfer',
      'mobile': 'Mobile Payment',
      'kbz': 'KBZ Pay',
      'wave': 'Wave Money',
      'aya': 'AYA Pay',
      'commission': 'Commission' // This won't be shown due to filtering, but kept for completeness
    };
    
    return methodMap[method] || method;
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

  const currencySymbol = user.currencySymbol || '$';
  const totalDeposits = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

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
          <h1 className="text-xl font-bold">{t('depositRecords.title')}</h1>
        </div>

        {/* Summary Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ArrowDownCircle className="w-8 h-8 mr-3" />
              <div>
                <p className="text-white/80 text-sm">{t('depositRecords.totalDeposits')}</p>
                <h2 className="text-2xl font-bold">{currencySymbol}{totalDeposits.toFixed(2)}</h2>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm">{t('depositRecords.transactions')}</p>
              <h3 className="text-xl font-bold">{transactions.length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="px-6 py-8">
        {transactions.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <ArrowDownCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">{t('depositRecords.noDeposits')}</h3>
            <p className="text-gray-500">{t('depositRecords.noDepositsDesc')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="bg-white rounded-2xl p-6 shadow-sm">
                {/* Transaction Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {getStatusIcon(transaction.status)}
                    <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status === 'completed' ? t('depositRecords.completed') : transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-right">
                    <h3 className="text-xl font-bold text-green-600">
                      +{currencySymbol}{transaction.amount.toFixed(2)}
                    </h3>
                    <p className="text-sm text-gray-500">{formatDate(transaction.created_at)}</p>
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('depositRecords.paymentMethod')}:</span>
                    <span className="font-medium">
                      {transaction.payment_method === 'invitation_reward' 
                        ? t('depositRecords.invitationReward')
                        : getPaymentMethodDisplay(transaction.payment_method)
                      }
                    </span>
                  </div>
                  
                  {transaction.reference_id && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{t('depositRecords.referenceId')}:</span>
                      <div className="flex items-center">
                        <span className="font-mono text-sm mr-2">{transaction.reference_id}</span>
                        <button
                          onClick={() => copyReferenceId(transaction.reference_id!)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Copy className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {transaction.notes && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('depositRecords.notes')}:</span>
                      <span className="font-medium text-right max-w-48">
                        {transaction.notes.includes('Invitation reward for user:') 
                          ? transaction.notes.replace('Invitation reward for user:', t('depositRecords.invitationRewardFor'))
                          : transaction.notes
                        }
                      </span>
                    </div>
                  )}
                </div>

                {/* Status-specific information */}
                {transaction.status === 'pending' && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-xl">
                    <p className="text-sm text-yellow-700">
                      ⏳ Your deposit is being processed. This usually takes a few minutes.
                    </p>
                  </div>
                )}
                
                {transaction.status === 'failed' && (
                  <div className="mt-4 p-3 bg-red-50 rounded-xl">
                    <p className="text-sm text-red-700">
                      ❌ This deposit failed. Please contact support if you believe this is an error.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Real-time Indicator */}
        <div className="mt-8 flex items-center justify-center">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>{t('depositRecords.realTimeUpdates')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};