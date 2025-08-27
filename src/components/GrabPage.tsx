import React, { useState } from 'react';
import { DollarSign, TrendingUp, Package, Users } from 'lucide-react';
import { useRealTimeUser } from '../hooks/useRealTimeUser';
import { useRealTimeOrders } from '../hooks/useRealTimeOrders';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

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

const predefinedAvatars = [
  'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
  'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
  'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
  'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
  'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
  'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
  'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
];

export const GrabPage: React.FC = () => {
  const { user } = useAuth();
  const { user: realTimeUser } = useRealTimeUser(user?.id || null);
  const { orders, isLoading, updateOrderStatus } = useRealTimeOrders(user?.id || null);
  const { t } = useLanguage();
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const currentUser = realTimeUser || user;

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  const completedOrders = orders.filter(order => order.status === 'completed');
  const pendingOrders = orders.filter(order => order.status === 'pending');
  const totalOrders = orders.length;
  
  // Get the next order that should be activated
  const getNextOrderToActivate = () => {
    const sortedOrders = [...orders].sort((a, b) => {
      const aNum = a.order_number || 0;
      const bNum = b.order_number || 0;
      return aNum - bNum;
    });

    // Find the first pending order where all previous orders are completed
    for (const order of sortedOrders) {
      if (order.status === 'pending') {
        const previousOrders = sortedOrders.filter(o => 
          (o.order_number || 0) < (order.order_number || 0)
        );
        const allPreviousCompleted = previousOrders.every(o => o.status === 'completed');
        
        if (allPreviousCompleted) {
          return order;
        }
      }
    }
    return null;
  };

  const nextOrder = getNextOrderToActivate();
  const hasOrdersToActivate = nextOrder !== null;
  const today = new Date().toDateString();
  const todaysIncome = completedOrders
    .filter(order => new Date(order.created_at).toDateString() === today)
    .reduce((sum, order) => sum + (order.commission || order.amount * 0.55), 0);

  const countryCurrency = getCurrencyByCountry(currentUser?.country || 'United States');

  const handleSubmitOrder = async () => {
    if (!nextOrder || isSubmittingOrder) return;

    setIsSubmittingOrder(true);
    try {
      // Update the order status to activate it
      await updateOrderStatus(nextOrder.id, 'pending');
      
      // Navigate to the order tab
      window.dispatchEvent(new CustomEvent('navigateToOrder'));
    } catch (error) {
      console.error('Error activating order:', error);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const commissionData = [
    { name: 'Wayne Thompson', amount: 1525.00 },
    { name: 'Larry Mason', amount: 4491.00 },
    { name: 'Ruby Lloyd', amount: 31305.00 },
    { name: 'Kathy Davis', amount: 42186.00 },
    { name: 'Catherine Turner', amount: 37214.00 },
    { name: 'Walter Simpson', amount: 30415.00 },
    { name: 'Paula White', amount: 47954.00 },
    { name: 'James Edwards', amount: 28047.00 },
    { name: 'Ashley Moore', amount: 13250.00 },
    { name: 'Brian Scott', amount: 9852.50 },
    { name: 'Olivia Taylor', amount: 19420.00 },
    { name: 'Jonathan Price', amount: 26310.75 },
    { name: 'Emily Brooks', amount: 17860.00 },
    { name: 'Steven Perry', amount: 34990.00 },
    { name: 'Amanda Cox', amount: 22500.00 },
    { name: 'Nicholas James', amount: 41020.00 },
    { name: 'Angela Bell', amount: 39000.00 },
    { name: 'Dylan Patterson', amount: 8700.00 },
    { name: 'Michelle Rogers', amount: 24950.00 },
    { name: 'Joshua Jenkins', amount: 19475.00 },
    { name: 'Rachel Hughes', amount: 32480.00 },
    { name: 'Christopher Hayes', amount: 15700.00 },
    { name: 'Laura Richardson', amount: 20340.00 },
    { name: 'Brandon Foster', amount: 28880.00 },
    { name: 'Jessica Coleman', amount: 33660.00 },
    { name: 'Kevin Barnes', amount: 16995.00 },
    { name: 'Samantha Bryant', amount: 19820.00 },
    { name: 'Tyler Rose', amount: 30740.00 },
    { name: 'Emma Chapman', amount: 35550.00 },
    { name: 'Adam Willis', amount: 27440.00 },
    { name: 'Chloe Hudson', amount: 43880.00 },
    { name: 'Jason Henry', amount: 22210.00 },
    { name: 'Natalie Armstrong', amount: 25175.00 },
    { name: 'Benjamin Graham', amount: 31200.00 },
    { name: 'Victoria Spencer', amount: 42110.00 },
    { name: 'Samuel Bishop', amount: 38440.00 },
    { name: 'Abigail Reynolds', amount: 20530.00 },
    { name: 'Ryan Powell', amount: 29370.00 }
  ].map((item, index) => ({
    ...item,
    avatar: predefinedAvatars[index % predefinedAvatars.length]
  }));

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <style>
        {`
        @keyframes scrollCommission {
          0% { transform: translateY(0%); }
          100% { transform: translateY(-50%); }
        }
        .animate-scrollCommission {
          animation: scrollCommission 20s linear infinite;
        }
        `}
      </style>

      <div className="bg-white px-6 pt-12 pb-8">
        <div className="mb-8">
          <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-yellow-100 rounded-2xl overflow-hidden relative">
            <img 
              src="https://i.postimg.cc/RZ3S2ncR/4938343085180563210-121.jpg"
              alt="Illustration"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <button 
          onClick={handleSubmitOrder}
          disabled={!hasOrdersToActivate || isSubmittingOrder}
          className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all duration-200 mb-8 ${
            hasOrdersToActivate && !isSubmittingOrder
              ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:shadow-xl transform hover:scale-[1.02]'
              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          }`}
        >
          {isSubmittingOrder ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Activating...</span>
            </div>
          ) : hasOrdersToActivate ? (
            t('orders.submitOrder')
          ) : (
            t('orders.noOrdersAvailable')
          )}
        </button>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-2">{t('orders.currentBalance')}</p>
            <h3 className="text-2xl font-bold text-yellow-500">
              {countryCurrency.symbol}{currentUser.balance.toFixed(2)}
            </h3>
          </div>
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-2">{t('orders.todaysIncome')}</p>
            <h3 className="text-2xl font-bold text-yellow-500">
              {countryCurrency.symbol}{todaysIncome.toFixed(2)}
            </h3>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className="flex items-center">
            <span className="text-3xl font-bold text-yellow-500">{completedOrders.length % 5}</span>
            <span className="text-gray-500 mx-2">/</span>
            <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
              <span className="text-white font-bold">5</span>
            </div>
          </div>
        </div> 
      </div>

      {/* Animated Commission List */}
      <div className="px-6">
        <div className="h-96 overflow-hidden relative">
          <div className="animate-scrollCommission space-y-4 absolute top-0 left-0 w-full">
            {[...commissionData, ...commissionData].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = predefinedAvatars[0];
                      }}
                    />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{item.name}</h4>
                    <p className="text-sm text-gray-500">get commission</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-yellow-500">
                    {countryCurrency.symbol}{item.amount.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
            <Package className="w-8 h-8 text-green-500 mx-auto mb-3" />
            <h4 className="text-lg font-bold text-gray-800 mb-1">{t('orders.completed')}</h4>
            <p className="text-2xl font-bold text-green-500">{completedOrders.length}</p>
            <p className="text-sm text-gray-500 mt-1">{t('orders.ordersCompleted')}</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
            <Package className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
            <h4 className="text-lg font-bold text-gray-800 mb-1">{t('orders.pending')}</h4>
            <p className="text-2xl font-bold text-yellow-500">{pendingOrders.length}</p>
            <p className="text-sm text-gray-500 mt-1">{t('orders.ordersPending')}</p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>{t('orders.realTimeOrderUpdates')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
