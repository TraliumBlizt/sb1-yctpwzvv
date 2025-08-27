import React from 'react';
import { ArrowLeft, ArrowUpCircle, Clock, CheckCircle, XCircle, Copy, AlertCircle } from 'lucide-react';
import { useRealTimeUser } from '../hooks/useRealTimeUser';
import { useRealTimeTransactions } from '../hooks/useRealTimeTransactions';

interface WithdrawalRecordsPageProps {
  userId: string;
  onBack: () => void;
}

export const WithdrawalRecordsPage: React.FC<WithdrawalRecordsPageProps> = ({ userId, onBack }) => {
  const { user, isLoading: userLoading } = useRealTimeUser(userId);
  const { transactions, isLoading: transactionsLoading } = useRealTimeTransactions(userId, 'withdrawal');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅ Withdrawal completed successfully';
      case 'pending':
        return '⏳ Withdrawal is being processed';
      case 'failed':
        return '❌ Withdrawal failed or was rejected - Amount restored to balance';
      default:
        return 'Status unknown';
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
      'card': 'Debit Card',
      'bank': 'Bank Transfer',
      'mobile': 'Mobile Payment',
      'kbz': 'KBZ Pay',
      'wave': 'Wave Money',
      'aya': 'AYA Pay'
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
  const totalWithdrawals = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const pendingWithdrawals = transactions
    .filter(t => t.status === 'pending')
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
          <h1 className="text-xl font-bold">Withdrawal Records</h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center mb-2">
              <ArrowUpCircle className="w-6 h-6 mr-2" />
              <p className="text-white/80 text-sm">Total Withdrawn</p>
            </div>
            <h2 className="text-xl font-bold">{currencySymbol}{totalWithdrawals.toFixed(2)}</h2>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center mb-2">
              <Clock className="w-6 h-6 mr-2" />
              <p className="text-white/80 text-sm">Pending</p>
            </div>
            <h2 className="text-xl font-bold">{currencySymbol}{pendingWithdrawals.toFixed(2)}</h2>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="px-6 py-8">
        {transactions.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
           
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Withdrawals Yet</h3>
            <p className="text-gray-500">Your withdrawal transactions will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="bg-white rounded-2xl p-6 shadow-sm">
                {/* Transaction Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {getStatusIcon(transaction.status)}
                    <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(transaction.status)}`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-right">
                    <h3 className="text-xl font-bold text-red-600">
                      -{currencySymbol}{transaction.amount.toFixed(2)}
                    </h3>
                    <p className="text-sm text-gray-500">{formatDate(transaction.created_at)}</p>
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Withdrawal Method:</span>
                    <span className="font-medium">{getPaymentMethodDisplay(transaction.payment_method)}</span>
                  </div>
                  
                  {transaction.reference_id && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Reference ID:</span>
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
                      <span className="text-gray-600">Notes:</span>
                      <span className="font-medium text-right max-w-48">{transaction.notes}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-600">Processing Time:</span>
                    <span className="font-medium">
                      {transaction.payment_method === 'card' ? 'Instant' : '1-3 business days'}
                    </span>
                  </div>
                </div>

                {/* Status Message */}
                <div className={`mt-4 p-3 rounded-xl border ${getStatusColor(transaction.status)}`}>
                  <p className="text-sm font-medium">
                    {getStatusMessage(transaction.status)}
                  </p>
                  {transaction.status === 'pending' && (
                    <p className="text-xs mt-1 opacity-75">
                      We'll notify you once the withdrawal is processed
                    </p>
                  )}
                  {transaction.status === 'failed' && (
                    <p className="text-xs mt-1 opacity-75">
                      Contact support if you need assistance
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Real-time Indicator */}
        <div className="mt-8 flex items-center justify-center">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Real-time status updates enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
};