import React from 'react';
import { ArrowLeft, Building2, Clock, CheckCircle, XCircle, Copy, AlertTriangle, User } from 'lucide-react';
import { useRealTimeUser } from '../hooks/useRealTimeUser';
import { useRealTimeWithdrawalRequests } from '../hooks/useRealTimeWithdrawalRequests';
import { useLanguage } from '../contexts/LanguageContext';

interface WithdrawalRequestsPageProps {
  userId: string;
  onBack: () => void;
}

export const WithdrawalRequestsPage: React.FC<WithdrawalRequestsPageProps> = ({ userId, onBack }) => {
  const { t } = useLanguage();
  const { user, isLoading: userLoading } = useRealTimeUser(userId);
  const { withdrawalRequests, isLoading: requestsLoading } = useRealTimeWithdrawalRequests(userId);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'approved':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅ Withdrawal completed and funds transferred';
      case 'approved':
        return '👍 Withdrawal approved, processing transfer';
      case 'pending':
        return '⏳ Withdrawal request is under review';
      case 'rejected':
        return '❌ Withdrawal request was rejected - Amount restored to balance';
      default:
        return 'Status unknown';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (userLoading || requestsLoading) {
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
  const totalRequested = withdrawalRequests.reduce((sum, req) => sum + req.amount, 0);
  const completedAmount = withdrawalRequests
    .filter(req => req.status === 'completed')
    .reduce((sum, req) => sum + req.amount, 0);
  const pendingAmount = withdrawalRequests
    .filter(req => req.status === 'pending')
    .reduce((sum, req) => sum + req.amount, 0);

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
          <h1 className="text-xl font-bold">{t('withdrawalRequests.title')}</h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3">
            <div className="flex items-center mb-1">
              <Building2 className="w-5 h-5 mr-2" />
              <p className="text-white/80 text-xs">{t('withdrawalRequests.total')}</p>
            </div>
            <h2 className="text-lg font-bold">{currencySymbol}{totalRequested.toFixed(2)}</h2>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3">
            <div className="flex items-center mb-1">
              <CheckCircle className="w-5 h-5 mr-2" />
              <p className="text-white/80 text-xs">{t('withdrawalRequests.completed')}</p>
            </div>
            <h2 className="text-lg font-bold">{currencySymbol}{completedAmount.toFixed(2)}</h2>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3">
            <div className="flex items-center mb-1">
              <Clock className="w-5 h-5 mr-2" />
              <p className="text-white/80 text-xs">{t('withdrawalRequests.pending')}</p>
            </div>
            <h2 className="text-lg font-bold">{currencySymbol}{pendingAmount.toFixed(2)}</h2>
          </div>
        </div>
      </div>

      {/* Withdrawal Requests List */}
      <div className="px-6 py-8">
        {withdrawalRequests.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">{t('withdrawalRequests.noRequests')}</h3>
            <p className="text-gray-500">{t('withdrawalRequests.noRequestsDesc')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {withdrawalRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-2xl p-6 shadow-sm">
                {/* Request Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {getStatusIcon(request.status)}
                    <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)}`}>
                      {request.status === 'completed' ? t('withdrawalRequests.completed') : 
                       request.status === 'pending' ? t('withdrawalRequests.pending') :
                       request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-right">
                    <h3 className="text-xl font-bold text-red-600">
                      -{currencySymbol}{request.amount.toFixed(2)}
                    </h3>
                    <p className="text-sm text-gray-500">{formatDate(request.created_at)}</p>
                  </div>
                </div>

                {/* Request Details */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bank:</span>
                    <span className="font-medium">{request.bank_name}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Country:</span>
                    <span className="font-medium">{request.country}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Name:</span>
                    <span className="font-medium">{request.account_name}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Account Number:</span>
                    <div className="flex items-center">
                      <span className="font-mono text-sm mr-2">{request.account_number}</span>
                      <button
                        onClick={() => copyToClipboard(request.account_number)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Copy className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>

                  {request.reviewed_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reviewed:</span>
                      <span className="font-medium text-sm">{formatDate(request.reviewed_at)}</span>
                    </div>
                  )}
                </div>

                {/* Status Message */}
                <div className={`mt-4 p-3 rounded-xl border ${getStatusColor(request.status)}`}>
                  <p className="text-sm font-medium">
                    {getStatusMessage(request.status)}
                  </p>
                  {request.admin_notes && (
                    <p className="text-xs mt-1 opacity-75">
                      <strong>Admin Note:</strong> {request.admin_notes}
                    </p>
                  )}
                  {request.status === 'pending' && (
                    <p className="text-xs mt-1 opacity-75">
                      We'll notify you once your request is reviewed
                    </p>
                  )}
                  {request.status === 'rejected' && (
                    <p className="text-xs mt-1 opacity-75">
                      The withdrawal amount has been returned to your account balance
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
            <span>{t('withdrawalRequests.realTimeUpdates')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};