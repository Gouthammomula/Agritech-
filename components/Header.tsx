import React from 'react';
import LeafIcon from './icons/LeafIcon';
import { useLanguage } from '../contexts/LanguageContext';

const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/80">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-green-600">
            <LeafIcon />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">{t('header.title')}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="hidden sm:inline text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-md">{t('header.version')}</span>
          <select 
            value={language} 
            onChange={handleLanguageChange}
            className="border border-gray-300 rounded-md py-1.5 pl-2 pr-8 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white hover:border-gray-400 transition"
            aria-label="Select language"
          >
            <option value="en">{t('languages.en')}</option>
            <option value="hi">{t('languages.hi')}</option>
            <option value="ta">{t('languages.ta')}</option>
            <option value="bn">{t('languages.bn')}</option>
          </select>
        </div>
      </div>
    </header>
  );
};

export default Header;