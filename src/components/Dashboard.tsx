import React, { useState } from 'react';
import { User } from '../types';
import { Share2, Activity , Volume2 } from 'lucide-react';
import { PortfolioCard } from './PortfolioCard';
import { HallOfFame } from './HallOfFame';
import { TasksList } from './TasksList';
import { ProfilePage } from './ProfilePage';
import { DepositPage } from './DepositPage';
import { WithdrawalPage } from './WithdrawalPage';
import { EnhancedWithdrawalPage } from './EnhancedWithdrawalPage';
import { useLanguage } from '../contexts/LanguageContext';
import { BottomNavigation } from './BottomNavigation';
import { ProfileEditPage } from './ProfileEditPage';
import { AccountingDetailsPage } from './AccountingDetailsPage';
import { DepositRecordsPage } from './DepositRecordsPage';
import { WithdrawalRecordsPage } from './WithdrawalRecordsPage';
import { AboutUsPage } from './AboutUsPage';
import { EnhancedDepositPage } from './EnhancedDepositPage';
import { GrabPage } from './GrabPage';
import { WithdrawalRequestsPage } from './WithdrawalRequestsPage';
import { useRealTimeUser } from '../hooks/useRealTimeUser';
import { useRealTimeOrders } from '../hooks/useRealTimeOrders';
import { VipStatusCard } from './VipStatusCard';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onBalanceUpdate: (newBalance: number) => void;
}


export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onBalanceUpdate }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('home');
  const [currentPage, setCurrentPage] = useState<string | null>(null);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdrawal, setShowWithdrawal] = useState(false);
  
  // Use real-time user data
  const { user: realTimeUser } = useRealTimeUser(user.id);
  const currentUser = realTimeUser || user;

  // Force re-render when balance changes by using balance as key
  const balanceKey = currentUser?.balance || 0;

  // Get real-time orders to check completion status
  const { orders } = useRealTimeOrders(user.id);
  
  // Check if all orders are completed
  const allOrdersCompleted = orders.length > 0 && orders.every(order => order.status === 'completed');
  const canWithdraw = allOrdersCompleted;
  const withdrawalMessage = !canWithdraw 
    ? orders.length === 0 
      ? t('orders.completeFirstOrderToUnlock')
      : `Complete all orders (${orders.filter(o => o.status === 'completed').length}/${orders.length}) to unlock withdrawals`
    : '';
  // Listen for navigation events from GrabPage
  React.useEffect(() => {
    const handleNavigateToOrder = () => {
      setActiveTab('order');
    };

    window.addEventListener('navigateToOrder', handleNavigateToOrder);
    return () => window.removeEventListener('navigateToOrder', handleNavigateToOrder);
  }, []);

  const stats = {
    yesterday: 0.00,
    accumulated: 0.00,
    today: 0.00
  };

  const getCurrencySymbol = (currency?: string) => {
    const currencyMap: { [key: string]: string } = {
      'USD': '$', 'EUR': '€', 'GBP': '£', 'CNY': '¥', 'INR': '₹',
      'MMK': 'K', 'ARS': '$', 'BOB': 'Bs', 'BRL': 'R$', 'CLP': '$',
      'COP': '$', 'CRC': '₡', 'GTQ': 'Q', 'MXN': '$', 'PEN': 'S/',
      'VES': 'Bs.S'
    };
    return currencyMap[currency || 'USD'] || '$';
  };

  if (showDeposit) {
    return (
      <EnhancedDepositPage
        user={currentUser}
        onBack={() => setShowDeposit(false)}
        onBalanceUpdate={onBalanceUpdate}
      />
    );
  }

  if (showWithdrawal) {
    return (
      <EnhancedWithdrawalPage
        user={currentUser}
        onBack={() => setShowWithdrawal(false)}
        onBalanceUpdate={onBalanceUpdate}
      />
    );
  }

  // Handle page navigation
  if (currentPage) {
    switch (currentPage) {
      case 'edit-profile':
        return <ProfileEditPage userId={currentUser.id} onBack={() => setCurrentPage(null)} />;
      case 'accounting':
        return <AccountingDetailsPage userId={currentUser.id} onBack={() => setCurrentPage(null)} />;
      case 'deposits':
        return <DepositRecordsPage userId={currentUser.id} onBack={() => setCurrentPage(null)} />;
      case 'withdrawals':
        return <WithdrawalRecordsPage userId={currentUser.id} onBack={() => setCurrentPage(null)} />;
      case 'withdrawal-requests':
        return <WithdrawalRequestsPage userId={currentUser.id} onBack={() => setCurrentPage(null)} />;
      case 'about':
        return <AboutUsPage onBack={() => setCurrentPage(null)} />;
      default:
        setCurrentPage(null);
        break;
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <>
            {/* Header */}
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
              <div className="px-6 pt-12 pb-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white rounded-full overflow-hidden">
                      <img
                        src={currentUser.avatar || 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{currentUser.firstName} {currentUser.lastName}</h2>
                      <p className="text-white/80 text-sm">ID: {currentUser.username}</p>
                     
                    </div>
                  </div>
                  <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>

                <PortfolioCard 
                  balance={currentUser.balance} 
                  stats={stats}
                  currencySymbol={getCurrencySymbol(currentUser.currency)}
                  onDeposit={() => setShowDeposit(true)}
                  onWithdrawal={() => canWithdraw && setShowWithdrawal(true)}
                  canWithdraw={canWithdraw}
                  withdrawalMessage={withdrawalMessage}
                  userId={currentUser.id}
                  key={`portfolio-${balanceKey}-${Date.now()}`} // Force re-render when balance changes
                />
              </div>

            
            </div>

            {/* Content */}
            <div className="bg-gray-50 px-6 pb-24">
              {/* Welcome Banner */}
              <div className="flex items-center bg-white rounded-xl p-4 mb-6 shadow-sm">
                <Volume2 className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0" />
                <p className="text-gray-700 text-sm">
                  {t('dashboard.welcome')}
                </p>
              </div>
              <HallOfFame />
            </div>

          </>
        );
      case 'order':
        return <TasksList />;
      case 'grab':
        return <GrabPage />;
      case 'profile':
        return <ProfilePage user={currentUser} onLogout={onLogout} onNavigate={setCurrentPage} />;
      default:
        return (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col min-h-screen">
        <div className="flex-1">
          {renderContent()}
        </div>
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
};