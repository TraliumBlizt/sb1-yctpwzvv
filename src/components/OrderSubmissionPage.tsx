import React, { useState } from 'react';
import { ArrowLeft, Package, CheckCircle, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { User } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

// Currency mapping by country
const getCurrencyByCountry = (country: string) => {
  const currencyMap: { [key: string]: { currency: string; symbol: string } } = {
    'Colombia': { currency: 'COP', symbol: '$' },
    'Costa Rica': { currency: 'CRC', symbol: '₡' },
    'Dominican Republic': { currency: 'DOP', symbol: 'RD$' },
    'Ecuador': { currency: 'USD', symbol: '$' },
    'Guatemala': { currency: 'GTQ', symbol: 'Q' },
    'Honduras': { currency: 'HNL', symbol: 'L' },
    'Mexico': { currency: 'MXN', symbol: '$' },
    'Nicaragua': { currency: 'NIO', symbol: 'C$' },
    'Panama': { currency: 'PAB', symbol: 'B/.' },
    'Paraguay': { currency: 'PYG', symbol: '₲' },
    'Peru': { currency: 'PEN', symbol: 'S/' },
    'El Salvador': { currency: 'USD', symbol: '$' },
    'Uruguay': { currency: 'UYU', symbol: '$U' },
    'Venezuela': { currency: 'VES', symbol: 'Bs.S' },
    'United States': { currency: 'USD', symbol: '$' },
    'China': { currency: 'CNY', symbol: '¥' },
    'France': { currency: 'EUR', symbol: '€' },
    'India': { currency: 'INR', symbol: '₹' },
    'United Kingdom': { currency: 'GBP', symbol: '£' },
    'Myanmar': { currency: 'MMK', symbol: 'K' },
    'Argentina': { currency: 'ARS', symbol: '$' },
    'Bolivia': { currency: 'BOB', symbol: 'Bs' },
    'Brasil': { currency: 'BRL', symbol: 'R$' },
    'Chile': { currency: 'CLP', symbol: '$' }
  };
  
  return currencyMap[country] || { currency: 'USD', symbol: '$' };
};

// Order images mapping
const getOrderImage = (orderType: string): string => {
  const imageMap: { [key: string]: string } = {
   'Order 1-1': 'https://i.postimg.cc/7P7vkS2V/4940948786004471401-120.jpg?auto=compress&cs=tinysrgb&w=400',
'Order 1-2': 'https://i.postimg.cc/MGX4rBw1/4940948786004471400-120.jpg',
'Order 1-3': 'https://i.postimg.cc/RFHYvzNF/4940948786004471422-120.jpg',
'Order 1-4': 'https://i.postimg.cc/KYd9qsJy/4940948786004471421-120.jpg',
'Order 1-5': 'https://i.postimg.cc/7PX3bW0Y/4940948786004471412-120.jpg',
'Order 2-1': 'https://i.postimg.cc/2yXLGg7Q/4940948786004471410-120.jpg',
'Order 2-2': 'https://i.postimg.cc/wjYjz6Mt/4940948786004471409-120.jpg',
'Order 2-3': 'https://i.postimg.cc/CdTSwNhy/4940948786004471408-120.jpg',
'Order 2-4': 'https://i.postimg.cc/cJ4gqskR/4940948786004471407-120.jpg',
'Order 2-5': 'https://i.postimg.cc/fR5yfGWJ/4940948786004471404-120.jpg',
'Order 3-1': 'https://i.postimg.cc/pT73bJxD/4940948786004471399-120.jpg',
'Order 3-2': 'https://i.postimg.cc/k5gH2pgQ/4940948786004471398-120.jpg',
'Order 3-3': 'https://i.postimg.cc/DZWYg4sm/4940948786004471397-120.jpg',
'Order 3-4': 'https://i.postimg.cc/G3y5TYd5/4940948786004471396-120.jpg',
'Order 3-5': 'https://i.postimg.cc/t4S5MC96/4940948786004471418-120.jpg',
'Order 4-1': 'https://i.postimg.cc/SNV7nN2P/4940948786004471417-120.jpg',
'Order 4-2': 'https://i.postimg.cc/QCh1MRXs/4940948786004471416-120.jpg',
'Order 4-3': 'https://i.postimg.cc/y8k9WhzJ/4940948786004471415-120.jpg',
'Order 4-4': 'https://i.postimg.cc/VsgbRZfr/4940948786004471420-120.jpg',
'Order 4-5': 'https://i.postimg.cc/qMYqb99R/6093486080016898802-120.jpg',
'Order 5-1': 'https://i.postimg.cc/3rq3Y29f/6093486080016898801-120.jpg',
'Order 5-2': 'https://i.postimg.cc/9fchJbF0/6093486080016898800-120.jpg',
'Order 5-3': 'https://i.postimg.cc/B6VfZG5P/6093486080016898799-120.jpg',
'Order 5-4': 'https://i.postimg.cc/13QX1p3h/6093486080016898798-120.jpg',
'Order 5-5': 'https://i.postimg.cc/FHprt863/6093486080016898797-120.jpg',
'Order 6-1': 'https://i.postimg.cc/5tkfyvbt/6093486080016898796-120.jpg',
'Order 6-2': 'https://i.postimg.cc/N0Lw3Mmv/6093486080016898795-120.jpg',
'Order 6-3': 'https://i.postimg.cc/1RDZhbnX/6093486080016898794-120.jpg',
'Order 6-4': 'https://i.postimg.cc/qMZwmvJ3/8-Living-Room-Furniture-Ideas-for-Your-New-Home.jpg',
'Order 6-5': 'https://i.postimg.cc/SKcGNLW6/image-6.webp'
  };
  
  return imageMap[orderType] || 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2';
};

interface OrderSubmissionPageProps {
  order: any;
  user: User;
  onBack: () => void;
  onOrderSubmitted: () => void;
}

export const OrderSubmissionPage: React.FC<OrderSubmissionPageProps> = ({ 
  order, 
  user, 
  onBack, 
  onOrderSubmitted 
}) => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  const countryCurrency = getCurrencyByCountry(user.country || 'United States');
  const commission = order.commission || order.amount * 0.55;

  const handleFinalSubmission = async () => {
    setIsSubmitting(true);
    
    try {
      // Update order status to completed
      const { error: orderError } = await supabase
        .from('orders')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (orderError) throw orderError;

      // Check if commission has already been applied for this order
      const { data: existingCommission, error: checkError } = await supabase
        .from('transactions')
        .select('id')
        .eq('user_id', user.id)
        .eq('reference_id', `COMM-${order.id}`)
        .eq('type', 'deposit')
        .eq('payment_method', 'commission')
        .maybeSingle();

      if (checkError) {
        throw checkError;
      }

      let newBalance = user.balance;

      // Only apply commission if it hasn't been applied before
      if (!existingCommission) {
        // Add commission to user balance
        newBalance = user.balance + commission;
        const { error: balanceError } = await supabase
          .from('users')
          .update({ 
            balance: newBalance,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (balanceError) throw balanceError;

        // Create a transaction record for the commission
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            type: 'deposit',
            amount: commission,
            status: 'completed',
            payment_method: 'commission',
            reference_id: `COMM-${order.id}`,
            notes: `Commission from order ${order.order_type}`
          });

        if (transactionError) throw transactionError;
      }

      setSubmissionResult({
        orderId: order.id,
        commission: existingCommission ? 0 : commission, // Show 0 if already applied
        newBalance: newBalance,
        previousBalance: user.balance
      });
      setShowSuccess(true);

      // Auto-navigate back after 3 seconds
      setTimeout(() => {
        onOrderSubmitted();
      }, 2000);

    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess && submissionResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Completed!</h2>
          <p className="text-gray-600 mb-6">
            {t('orders.orderCompleted')}
          </p>
          
          <div className="bg-green-50 rounded-xl p-4 mb-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-green-700">{t('orders.previousBalance')}</span>
                <span className="font-semibold">{countryCurrency.symbol}{submissionResult.previousBalance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">{t('orders.orderCode')}</span>
                <span className="font-semibold">{order.order_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">{t('orders.commission')}</span>
                <span className="font-bold text-green-600">
                  +{countryCurrency.symbol}{submissionResult.commission.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-t border-green-200 pt-3">
                <span className="text-green-700 font-bold">{t('orders.newBalance')}</span>
                <span className="font-bold text-lg text-green-600">
                  {countryCurrency.symbol}{submissionResult.newBalance.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mb-4">
            {t('general.loading')}
          </p>
          
          <button
            onClick={onOrderSubmitted}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold"
          >
            {t('general.continue')}
          </button>
        </div>
      </div>
    );
  }

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
          <h1 className="text-xl font-bold">Submit Order</h1>
        </div>

        {/* Order Info Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-lg overflow-hidden mr-3 bg-white/20">
              <img
                src={getOrderImage(order.order_type)}
                alt={order.order_name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2';
                }}
              />
            </div>
            <div>
              <h2 className="text-lg font-bold">{order.order_type}</h2>
              <p className="text-white/80 text-sm">Ready for submission</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        {/* Order Details */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">{t('orders.orderCode')}</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">{t('orders.orderCode')}</span>
              <span className="font-semibold">{order.order_name}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">{t('orders.orderCode')}</span>
              <span className="font-semibold">{order.order_type}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">{t('orders.orderValue')}</span>
              <span className="font-semibold">{countryCurrency.symbol}{order.amount.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">{t('orders.commission')}</span>
              <span className="font-bold text-green-600">
                {countryCurrency.symbol}{commission.toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                Ready to Submit
              </span>
            </div>
          </div>
        </div>

        {/* Balance Information */}
        <div className="bg-blue-50 rounded-2xl p-6 shadow-sm mb-6">
          <h3 className="text-lg font-bold text-blue-800 mb-4">{t('orders.currentBalance')}</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-blue-700">{t('orders.currentBalance')}</span>
              <span className="font-semibold">{countryCurrency.symbol}{user.balance.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-blue-700">{t('orders.commission')}</span>
              <span className="font-semibold text-green-600">
                +{countryCurrency.symbol}{commission.toFixed(2)}
              </span>
            </div>
            
            <div className="border-t border-blue-200 pt-3">
              <div className="flex justify-between">
                <span className="text-blue-800 font-semibold">{t('orders.currentBalance')}</span>
                <span className="font-bold text-lg text-blue-600">
                  {countryCurrency.symbol}{(user.balance + commission).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 rounded-2xl p-4 mb-6 border border-yellow-200">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-800 mb-1">Important</h4>
              <p className="text-sm text-yellow-700">
                Once you submit this order, it will be marked as completed and the commission will be added to your balance. This action cannot be undone.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleFinalSubmission}
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{t('orders.submitting')}</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>{t('orders.submitOrder')}</span>
            </div>
          )}
        </button>

        {/* Info */}
        <div className="mt-6 p-4 bg-gray-100 rounded-xl">
          <p className="text-sm text-gray-600 text-center">
            Your order will be processed immediately and the commission will be added to your account balance.
          </p>
        </div>
      </div>
    </div>
  );
};