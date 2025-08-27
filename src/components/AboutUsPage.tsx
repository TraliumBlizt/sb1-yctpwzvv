import React from 'react';
import { ArrowLeft, Target, Mail, Phone } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface AboutUsPageProps {
  onBack: () => void;
}

export const AboutUsPage: React.FC<AboutUsPageProps> = ({ onBack }) => {
  const { t } = useLanguage();
  
  const features = [
    {
      image: 'https://i.postimg.cc/d1xHCNYw/smart-wallet-concept-credit-debit-600nw-2083048594.webp',
      title: t('about.bankSecurity'),
      description: t('about.bankSecurityDesc'),
    },
    {
      image: 'https://i.postimg.cc/T3cXbxHx/istockphoto-1192784131-612x612.jpg',
      title: t('about.lightningFast'),
      description: t('about.lightningFastDesc'),
    },
    {
      image: 'https://i.postimg.cc/DZSVRXff/gettyimages-1727335145-612x612.jpg',
      title: t('about.globalCommunity'),
      description: t('about.globalCommunityDesc'),
    },
    {
      image: 'https://i.postimg.cc/63tcvsSk/24hr-services-with-clock-scale-66219-761.avif',
      title: t('about.support247'),
      description: t('about.support247Desc'),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white px-6 pt-12 pb-8">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 mr-4"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">{t('about.title')}</h1>
        </div>

        {/* Hero Section */}
        <div className="text-center">
          <div className="w-[300px] aspect-[2.05] bg-white rounded-lg shadow-lg mb-4 mx-auto overflow-hidden">
            <img
              src="https://i.postimg.cc/MHkwxkw4/4922451504321900439-120.jpg"
              alt="Hero"
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold mb-1">{t('about.hero')}</h2>
          <p className="text-white/90 text-lg">{t('about.subtitle')}</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        {/* Mission */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <div className="flex items-center mb-4">
            <Target className="w-6 h-6 text-yellow-600 mr-3" />
            <h3 className="text-lg font-bold text-gray-800">{t('about.mission')}</h3>
          </div>
          <p className="text-gray-600 leading-relaxed">
            {t('about.missionText')}
          </p>
        </div>

        {/* Features */}
<div className="grid grid-cols-2 sm:grid-cols-2 gap-4 mb-6"> 
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col"
            >
              <div className="w-full h-40 sm:h-48">
                <img 
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover"
                /> 
              </div>
              <div className="p-1 sm:p-1 flex flex-col flex-1">
                <h4 className="font-semibold text-gray-800 text-base sm:text-0.5 mb-1">  
                  {feature.title}
                </h4>
                <p className="text-gray-600 text-sm sm:text-0.5 flex-1">
                  {feature.description}
                </p>
              </div> 
            </div>
          ))}
        </div>



        {/* Statistics */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white mb-8">
          <h3 className="text-lg font-bold mb-6 text-center">{t('about.statistics')}</h3>
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-4 text-center">
            <div>
              <h4 className="text-2xl font-bold">150K+</h4>
              <p className="text-white/80 text-sm">{t('about.activeUsers')}</p>
            </div>
            <div>
              <h4 className="text-2xl font-bold">1M+</h4>
              <p className="text-white/80 text-sm">{t('about.transactions')}</p>
            </div>
            <div>
              <h4 className="text-2xl font-bold">17+</h4>
              <p className="text-white/80 text-sm">{t('about.countries')}</p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6">{t('about.contact')}</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-yellow-600 mr-4" />
              <div>
                <p className="font-medium text-gray-800">{t('about.emailSupport')}</p>
                <p className="text-gray-600 text-sm">support@financialplatform.com</p>
              </div>
            </div>
            <div className="flex items-center">
              <Phone className="w-5 h-5 text-yellow-600 mr-4" />
              <div>
                <p className="font-medium text-gray-800">{t('about.phoneSupport')}</p>
                <p className="text-gray-600 text-sm">+1 (555) 123-4567</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            {t('about.copyright')}
          </p>
          <p className="text-gray-400 text-xs mt-1">
            {t('about.licensed')}
          </p>
        </div>
      </div>
    </div>
  );
};
