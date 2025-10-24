import React from 'react';
import Header from './components/Header';
import DiseaseDetector from './components/DiseaseDetector';
import { LanguageProvider } from './contexts/LanguageContext';
import { useLanguage } from './contexts/LanguageContext';

const AppContent = () => {
  const { t } = useLanguage();
  const year = new Date().getFullYear();
  const copyrightText = t('footer.copyright', { year });

  return (
    <div className="bg-gradient-to-br from-green-50 to-gray-100 min-h-screen font-sans text-gray-800">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <DiseaseDetector />
      </main>
      <footer className="text-center py-6 text-gray-500 text-sm">
        <p dangerouslySetInnerHTML={{ __html: copyrightText }}></p>
      </footer>
    </div>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;