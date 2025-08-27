import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center space-x-2">
      <Globe className="w-5 h-5 text-gray-600" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'en' | 'es')}
        className="bg-transparent border-none text-gray-700 font-medium focus:outline-none cursor-pointer"
      >
        <option value="en">English</option>
        <option value="es">Español</option>
        
      </select>
    </div>
  );
};