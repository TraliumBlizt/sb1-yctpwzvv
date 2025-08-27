import React from 'react';
import { Home, HandCoins , SendToBack , SquareUser  } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const { t } = useLanguage();
  
  const tabs = [
    { key: 'home', label: t('nav.home'), icon: Home },
    { key: 'grab', label: t('nav.grab'), icon: HandCoins  },
    { key: 'order', label: t('nav.order'), icon: SendToBack  },
    { key: 'profile', label: t('nav.profile'), icon: SquareUser  },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 sm:px-4 py-2 safe-area-pb">
      <div className="flex justify-around">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex flex-col items-center py-2 px-1 sm:px-3 rounded-lg transition-colors min-w-0 ${
              activeTab === tab.key
                ? 'text-yellow-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium truncate">{tab.label}</span>
           
          </button>
        ))}
      </div>
    </div>
  );
};