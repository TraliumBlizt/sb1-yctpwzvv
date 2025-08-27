import React, { useState, useEffect } from 'react';
import { ArrowDownCircle, ArrowUpCircle, TrendingUp, TrendingDown, BadgeDollarSign } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Transaction } from '../types';

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
 
export const HallOfFame: React.FC = () => {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

 const transactions: (Transaction & { avatar: string })[] = [
    { id: '1', user: 'R**z', type: 'withdrawal', amount: 13117.00, timestamp: new Date(), status: 'completed', avatar: predefinedAvatars[0] },
    { id: '2', user: 'C**a', type: 'deposit', amount: 9960.00, timestamp: new Date(), status: 'completed', avatar: predefinedAvatars[1] },
    { id: '3', user: 'L**z', type: 'withdrawal', amount: 6749.00, timestamp: new Date(), status: 'completed', avatar: predefinedAvatars[2] },
    { id: '4', user: 'A**O', type: 'deposit', amount: 7972.00, timestamp: new Date(), status: 'completed', avatar: predefinedAvatars[3] },
    { id: '5', user: 'J**z', type: 'deposit', amount: 14000.00, timestamp: new Date(), status: 'completed', avatar: predefinedAvatars[4] },
    { id: '6', user: 'K**a', type: 'deposit', amount: 4445.00, timestamp: new Date(), status: 'completed', avatar: predefinedAvatars[5] },
    { id: '7', user: 'M**n', type: 'withdrawal', amount: 8250.00, timestamp: new Date(), status: 'completed', avatar: predefinedAvatars[6] },
    { id: '8', user: 'S**e', type: 'deposit', amount: 12300.00, timestamp: new Date(), status: 'completed', avatar: predefinedAvatars[7] },

    // Randomly Generated Transactions (20 more)
    { id: '9', user: 'T**m', type: 'deposit', amount: 5600.00, timestamp: new Date(), status: 'completed', avatar: predefinedAvatars[1] },
    { id: '10', user: 'B**y', type: 'withdrawal', amount: 3200.00, timestamp: new Date(), status: 'pending', avatar: predefinedAvatars[2] },
    { id: '11', user: 'D**n', type: 'deposit', amount: 8900.00, timestamp: new Date(), status: 'completed', avatar: predefinedAvatars[0] },
    { id: '12', user: 'E**a', type: 'withdrawal', amount: 4500.00, timestamp: new Date(), status: 'failed', avatar: predefinedAvatars[6] },
    { id: '13', user: 'F**k', type: 'deposit', amount: 12000.00, timestamp: new Date(), status: 'completed', avatar: predefinedAvatars[3] },
    { id: '14', user: 'G**e', type: 'withdrawal', amount: 7800.00, timestamp: new Date(), status: 'completed', avatar: predefinedAvatars[4] },
    { id: '15', user: 'H**n', type: 'deposit', amount: 3400.00, timestamp: new Date(), status: 'pending', avatar: predefinedAvatars[5] },
    { id: '16', user: 'I**a', type: 'withdrawal', amount: 9200.00, timestamp: new Date(), status: 'completed', avatar: predefinedAvatars[7] },
    { id: '17', user: 'J**e', type: 'deposit', amount: 6700.00, timestamp: new Date(), status: 'failed', avatar: predefinedAvatars[0] },
    { id: '18', user: 'K**o', type: 'withdrawal', amount: 5300.00, timestamp: new Date(), status: 'completed', avatar: predefinedAvatars[1] },
    { id: '19', user: 'L**i', type: 'deposit', amount: 8100.00, timestamp: new Date(), status: 'completed', avatar: predefinedAvatars[2] },
    { id: '20', user: 'M**a', type: 'withdrawal', amount: 2900.00, timestamp: new Date(), status: 'pending', avatar: predefinedAvatars[3] },
    { id: '21', user: 'N**n', type: 'deposit', amount: 15000.00, timestamp: new Date(), status: 'completed', avatar: predefinedAvatars[4] },
    { id: '22', user: 'O**l', type: 'withdrawal', amount: 6200.00, timestamp: new Date(), status: 'failed', avatar: predefinedAvatars[5] },
    { id: '23', user: 'P**r', type: 'deposit', amount: 4300.00, timestamp: new Date(), status: 'completed', avatar: predefinedAvatars[6] },
    { id: '24', user: 'Q**u', type: 'withdrawal', amount: 8800.00, timestamp: new Date(), status: 'completed', avatar: predefinedAvatars[4] },
    { id: '25', user: 'R**t', type: 'deposit', amount: 7700.00, timestamp: new Date(), status: 'pending', avatar: predefinedAvatars[4] },
    { id: '26', user: 'S**y', type: 'withdrawal', amount: 5100.00, timestamp: new Date(), status: 'completed', avatar: predefinedAvatars[5] },
    { id: '27', user: 'U**z', type: 'deposit', amount: 9400.00, timestamp: new Date(), status: 'failed', avatar: predefinedAvatars[6] },
    { id: '28', user: 'V**a', type: 'withdrawal', amount: 3600.00, timestamp: new Date(), status: 'completed', avatar: predefinedAvatars[7] },
];

  // Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % transactions.length);
        setIsAnimating(false);
      }, 500);
    }, 2000);

    return () => clearInterval(interval);
  }, [transactions.length]);

  const getVisibleTransactions = () => {
    const visible = [];
    for (let i = 0; i < 6; i++) {
      const index = (currentIndex + i) % transactions.length;
      visible.push(transactions[index]);
    }
    return visible;
  };

  const getTransactionIcon = (type: 'deposit' | 'withdrawal') => {
    if (type === 'deposit') {
      return <ArrowDownCircle className="w-5 h-5 text-green-500" />;
    }
    return <ArrowUpCircle className="w-5 h-5 text-red-500" />; 
  };

  const getTransactionStyle = (type: 'deposit' | 'withdrawal') => {
    if (type === 'deposit') {
      return {
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-600',
        amountColor: 'text-green-600',
        iconBg: 'bg-green-100'
      };
    }
    return {
      bgColor: 'bg-red-50', 
      borderColor: 'border-red-200',
      textColor: 'text-red-600',
      amountColor: 'text-red-600',
      iconBg: 'bg-red-100'
    };
  };

  const getTrendIcon = (type: 'deposit' | 'withdrawal') => {
    if (type === 'deposit') {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    }
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4 px-4">
        <h3 className="text-lg font-bold text-yellow-600">{t('hallOfFame.title')}</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>{t('hallOfFame.liveUpdates')}</span>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className={`transition-all duration-300 ${isAnimating ? 'opacity-50 transform scale-95' : 'opacity-100 transform scale-100'}`}>
          {getVisibleTransactions().map((transaction, index) => {
            const styles = getTransactionStyle(transaction.type);
            const isHighlighted = index === 0;
            
            return (
              <div 
                key={`${transaction.id}-${currentIndex}-${index}`}
                className={`flex items-center justify-between p-3 sm:p-4 border-b border-gray-100 last:border-b-0 transition-all duration-500 ${
                  isHighlighted 
                    ? `${styles.bgColor} ${styles.borderColor} border-l-4 transform scale-[1.02]` 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                  <div className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center ${
                    isHighlighted ? styles.iconBg : 'bg-gray-100'
                  } transition-all duration-300`}>
                    {isHighlighted ? getTransactionIcon(transaction.type) : (
                      <img
                        src={transaction.avatar}
                        alt={transaction.user}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = predefinedAvatars[0];
                        }}
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <p className={`font-semibold truncate ${isHighlighted ? styles.textColor : 'text-gray-800'}`}>
                        {transaction.user}
                      </p>
                      {isHighlighted && getTrendIcon(transaction.type)}
                    </div>
                    <div className="flex items-center space-x-2 flex-wrap">
                      <p className={`text-xs sm:text-sm capitalize ${isHighlighted ? styles.textColor : 'text-gray-500'}`}>
                        {transaction.type}
                      </p>
                      {isHighlighted && (
                        <div className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.type === 'deposit' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {transaction.type === 'deposit' ? '↓ IN' : '↑ OUT'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className={`font-bold break-all ${isHighlighted ? styles.amountColor : 'text-yellow-600'} ${
                    isHighlighted ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
                  } transition-all duration-300`}>
                    {transaction.type === 'withdrawal' ? '-' : '+'}{transaction.amount.toFixed(2)}
                  </p>
                  {isHighlighted && (
                    <p className="text-xs text-gray-500 mt-1 whitespace-nowrap">
                      {new Date().toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Progress indicator */}
        
      </div> 

      
    </div>
  );
}; 