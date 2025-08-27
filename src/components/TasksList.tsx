import React, { useState } from 'react';
import { ArrowLeft, Clock, CheckCircle, XCircle, Package, AlertTriangle, Plus, ArrowRight } from 'lucide-react';
import { useRealTimeOrders } from '../hooks/useRealTimeOrders';
import { useAuth } from '../hooks/useAuth';
import { useRealTimeUser } from '../hooks/useRealTimeUser';
import { useLanguage } from '../contexts/LanguageContext';
import { OrderSubmissionPage } from './OrderSubmissionPage';

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

export const TasksList: React.FC = () => {
  const { user } = useAuth();
  const { user: realTimeUser } = useRealTimeUser(user?.id || null);
  const { orders, isLoading, updateOrderStatus } = useRealTimeOrders(user?.id || null);
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'in-progress' | 'completed' | 'frozen'>('in-progress');
  const [submittingOrderId, setSubmittingOrderId] = useState<string | null>(null);
  const [showSubmissionPage, setShowSubmissionPage] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Use real-time user data for current balance
  const currentUser = realTimeUser || user;
  const currentBalance = currentUser?.balance || 0;
  const countryCurrency = getCurrencyByCountry(currentUser?.country || 'United States');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getFilteredOrders = () => {
    // Sort orders by order_number in ascending order
    const sortedOrders = [...orders].sort((a, b) => {
      const aNum = a.order_number || 0;
      const bNum = b.order_number || 0;
      return aNum - bNum;
    });

    switch (activeTab) {
      case 'in-progress':
        // For in-progress, show only the next pending order in sequence
        const nextPendingOrder = getNextPendingOrder(sortedOrders);
        return nextPendingOrder ? [nextPendingOrder] : [];
      case 'completed':
        return sortedOrders.filter(order => order.status === 'completed');
      case 'frozen':
        return sortedOrders.filter(order => order.status === 'cancelled');
      default:
        return [];
    }
  };

  const getNextPendingOrder = (sortedOrders: any[]) => {
    // Find the most recently updated pending order in sequence
    // This will be the order that was activated from the Grab page
    const now = new Date();
    const recentThreshold = 5 * 60 * 1000; // 5 minutes
    
    for (const order of sortedOrders) {
      if (order.status === 'pending') {
        // Check if all previous orders are completed
        const previousOrders = sortedOrders.filter(o => 
          (o.order_number || 0) < (order.order_number || 0)
        );
        const allPreviousCompleted = previousOrders.every(o => o.status === 'completed');
        
        if (allPreviousCompleted) {
          // Check if this order was recently updated (activated from Grab page)
          const updatedAt = new Date(order.updated_at);
          const timeDiff = now.getTime() - updatedAt.getTime();
          
          // Show the order if it was updated recently OR if it's the first order
          if (timeDiff <= recentThreshold || (order.order_number || 0) === 1) {
            return order;
          }
        }
      }
    }
    return null;
  };

  const filteredOrders = getFilteredOrders();

  const handleSubmitOrder = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Check if user has sufficient balance
    if (currentBalance < order.amount) {
      return; // Don't submit if insufficient balance
    }

    // Navigate to submission page
    setSelectedOrder(order);
    setShowSubmissionPage(true);
  };

  const handleOrderSubmitted = () => {
    setShowSubmissionPage(false);
    setSelectedOrder(null);
    
    // Check if all orders are now completed
    const allCompleted = orders.every(order => order.status === 'completed');
    if (allCompleted) {
      // Show success message that withdrawals are unlocked
      setTimeout(() => {
        alert(t('orders.withdrawalUnlocked'));
      }, 1000);
    }
    
    // Move to next order after submission
  };

  const getRequiredTopUp = (orderAmount: number) => {
    return Math.max(0, orderAmount - currentBalance);
  };

  const canSubmitOrder = (orderAmount: number) => {
    return currentBalance >= orderAmount;
  };

  const tabs = [
    { key: 'in-progress', label: t('orders.inProgress') },
    { key: 'completed', label: t('orders.completed') },
    { key: 'frozen', label: t('orders.frozen') }
  ] as const;

  if (showSubmissionPage && selectedOrder) {
    return (
      <OrderSubmissionPage
        order={selectedOrder}
        user={currentUser}
        onBack={() => setShowSubmissionPage(false)}
        onOrderSubmitted={handleOrderSubmitted}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white px-6 py-4 shadow-sm flex-shrink-0">
        <div className="flex items-center">
          <button className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
            
          </button>
          <h1 className="text-lg font-semibold text-gray-800 ml-2">{t('orders.title')}</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b flex-shrink-0">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
              }}
              className={`flex-1 py-4 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'text-yellow-600 border-yellow-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
        {/* Balance Display */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl p-4 sm:p-6 mb-6 transition-all duration-500">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-white/80 text-sm">{t('orders.currentBalance')}</p>
              <h3 
                className="text-xl sm:text-2xl font-bold break-all transition-all duration-700 transform hover:scale-105"
                data-balance-display
              >
                {countryCurrency.symbol}{currentBalance.toFixed(2)}
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white/80 text-xs">{t('orders.realTimeBalance')}</span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
          </div>
        ) : (
          <>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {activeTab === 'in-progress' && t('orders.noPendingOrders')}
                  {activeTab === 'completed' && t('orders.noCompletedOrders')}
                  {activeTab === 'frozen' && t('orders.noCancelledOrders')}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* All Orders List */}
                {filteredOrders.map((order, index) => (
                  <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {/* Order Header */}
                    <div className="p-3 sm:p-4 border-b bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          {getStatusIcon(order.status)}
                          <span className="ml-2 text-xs sm:text-sm font-medium text-gray-800 truncate">
                            {order.order_type}
                          </span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'completed' ? 'bg-green-100 text-green-700' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-yellow-600 mb-1 truncate">
                        {t('orders.time')} {new Date(order.created_at).toLocaleString()}
                      </p>
                      <p className="text-xs sm:text-sm text-yellow-600 truncate">
                        {t('orders.orderCode')} {order.id}
                      </p>
                    </div>

                    {/* Order Content */}
                    <div className="p-3 sm:p-4">
                      <div className="flex space-x-3 sm:space-x-4 mb-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                          <img
                            src={getOrderImage(order.order_type)}
                            alt={order.order_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-800 mb-2 leading-relaxed break-words">
                            {order.order_name}
                          </h3>
                          {order.description && (
                            <p className="text-xs text-gray-500 mb-2 break-words">
                              {order.description === 'Entry level package equal to user balance' 
                                ? t('orders.entryLevelPackage')
                                : order.description
                              }
                            </p>
                          )}
                          <div className="flex justify-between items-center text-sm text-gray-500">
                            <span className="break-all">{countryCurrency.symbol}{order.amount.toFixed(2)}</span>
                            <span>x1</span>
                          </div>
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('orders.orderValue')}</span>
                          <span className="font-semibold break-all">{countryCurrency.symbol}{order.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('orders.commission')}</span>
                          <span className="font-semibold text-yellow-600 break-all">
                            {countryCurrency.symbol}{(order.commission || order.amount * 0.55).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Order Actions - Only show for pending orders */}
                      {order.status === 'pending' && (
                        <div className="space-y-3">
                          {/* Balance Check */}
                          {!canSubmitOrder(order.amount) && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4">
                              <div className="flex items-start space-x-3">
                                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <h4 className="font-semibold text-red-800 mb-1">{t('orders.insufficientBalance')}</h4>
                                  <p className="text-xs sm:text-sm text-red-700 mb-2">
                                    {t('orders.needMoreFunds').replace('{amount}', `${countryCurrency.symbol}${getRequiredTopUp(order.amount).toFixed(2)}`)}
                                  </p>
                                  <div className="text-xs text-red-600 space-y-1">
                                    <div className="flex justify-between">
                                      <span>{t('orders.orderAmount')}</span>
                                      <span className="font-medium break-all">{countryCurrency.symbol}{order.amount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>{t('orders.currentBalance')}</span>
                                      <span className="font-medium break-all">{countryCurrency.symbol}{currentBalance.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between border-t border-red-300 pt-1">
                                      <span>{t('orders.requiredTopUp')}</span>
                                      <span className="font-bold break-all">{countryCurrency.symbol}{getRequiredTopUp(order.amount).toFixed(2)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Submit Button */}
                          <button 
                            onClick={() => handleSubmitOrder(order.id)}
                            disabled={!canSubmitOrder(order.amount) || submittingOrderId === order.id}
                            className={`w-full py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 ${
                              canSubmitOrder(order.amount) && submittingOrderId !== order.id
                                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:shadow-xl transform hover:scale-[1.02]'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {submittingOrderId === order.id ? (
                              <div className="flex items-center justify-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>{t('orders.submitting')}</span>
                              </div>
                            ) : canSubmitOrder(order.amount) ? (
                              t('orders.submitOrder')
                            ) : (
                              <div className="flex items-center justify-center space-x-2">
                                <Plus className="w-4 h-4" />
                                <span>{t('orders.topUpRequired')}</span>
                              </div>
                            )}
                          </button>

                          {/* Top-up Suggestion */}
                          {!canSubmitOrder(order.amount) && (
                            <div className="text-center">
                              <p className="text-sm text-gray-600 mb-2">{t('orders.addFunds')}</p>
                              <button className="text-yellow-600 hover:text-yellow-700 font-medium text-sm underline">
                                {t('orders.goToDeposit')}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Status Message for completed/cancelled orders */}
                      {order.status === 'completed' && (
                        <div className="w-full bg-green-50 border border-green-200 text-green-700 py-3 px-4 rounded-xl text-center font-medium">
                          ✅ {t('orders.orderCompleted')}
                        </div>
                      )}

                      {order.status === 'cancelled' && (
                        <div className="w-full bg-red-50 border border-red-200 text-red-700 py-3 px-4 rounded-xl text-center font-medium">
                          ❌ {t('orders.orderCancelled')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
 
              </div>
            )}
          </>
        )}

        {/* Progress indicator for in-progress orders */}
        {/* Real-time Indicator */}
        <div className="mt-8 flex items-center justify-center">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>{t('orders.realTimeUpdates')}</span>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};