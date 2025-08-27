import React from 'react';
import { Crown, Clock, CheckCircle, AlertTriangle, Star } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useRealTimeVipStatus } from '../hooks/useRealTimeVipStatus';

interface VipStatusCardProps {
  userId: string;
  className?: string;
}

export const VipStatusCard: React.FC<VipStatusCardProps> = ({ userId, className = '' }) => {
  const { t } = useLanguage();
  const { vipStatus, isLoading, getVipLevelName, getVipLevelColor, getVipBenefits } = useRealTimeVipStatus(userId);

  if (isLoading) {
    return (
      <div className={`bg-white rounded-2xl p-6 shadow-sm ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const { isVip, vipLevel, verification, isExpiringSoon, daysUntilExpiry } = vipStatus;

  return (
    <div className={`bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-sm border ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${isVip ? 'bg-yellow-100' : 'bg-gray-100'}`}>
            <Crown className={`w-6 h-6 ${isVip ? 'text-yellow-600' : 'text-gray-400'}`} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{t('vip.status')}</h3>
            <p className="text-sm text-gray-500">{t('vip.membershipLevel')}</p>
          </div>
        </div>
        
        {/* Real-time indicator */}
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500">{t('vip.live')}</span> 
        </div>
      </div>

      {/* VIP Level Badge */}
      <div className="mb-4">
        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${getVipLevelColor(vipLevel)}`}>
          {vipLevel > 0 && <Star className="w-4 h-4 mr-1" />}
          {getVipLevelName(vipLevel)}
        </span>
      </div>

      {/* Status Information */}
      {isVip && verification && (
        <div className="space-y-3 mb-4">
          {/* Verification Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{t('vip.status')}:</span>
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-600 capitalize">
                {t('vip.verified')}
              </span>
            </div>
          </div>

          {/* Verification Date */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{t('vip.verified')}:</span>
            <span className="text-sm font-medium">
              {new Date(verification.verification_date).toLocaleDateString()}
            </span>
          </div>

          {/* Expiry Warning */}
          {isExpiringSoon && daysUntilExpiry && (
            <div className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-700">
                {t('vip.expiresIn', { days: daysUntilExpiry })}
              </span>
            </div>
          )}

          {/* Expiry Date */}
          {verification.expiry_date && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{t('vip.expires')}:</span>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium">
                  {new Date(verification.expiry_date).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Benefits */}
      {vipLevel > 0 && (
        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-800 mb-2">{t('vip.benefits')}:</h4>
          <div className="space-y-1">
            {getVipBenefits(vipLevel).slice(0, 3).map((benefit, index) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                <span className="text-xs text-gray-600">{benefit}</span>
              </div>
            ))}
            {getVipBenefits(vipLevel).length > 3 && (
              <p className="text-xs text-gray-500 mt-2">
                {t('vip.moreBenefitsText', { count: getVipBenefits(vipLevel).length - 3 })}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Non-VIP Message */}
      {!isVip && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500 mb-2">
            {t('vip.currentlyRegularMember')}
          </p>
          <p className="text-xs text-gray-400">
            {t('vip.contactSupportForBenefits')}
          </p>
        </div>
      )}
    </div>
  );
};