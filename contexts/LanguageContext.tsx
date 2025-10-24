
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';

const getNestedTranslation = (obj: any, path: string): string => {
  if (!obj) return path;
  return path.split('.').reduce((acc, part) => acc && acc[part], obj) || path;
};

interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string, replacements?: { [key: string]: string | number | null }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<string>('en');
  const [translations, setTranslations] = useState<{ [key: string]: any }>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllTranslations = async () => {
      try {
        const languages = ['en', 'hi', 'ta', 'bn'];
        const responses = await Promise.all(
          languages.map(lang => fetch(`/translations/${lang}.json`).then(res => res.json()))
        );
        const translationsData = languages.reduce((acc, lang, index) => {
          acc[lang] = responses[index];
          return acc;
        }, {} as { [key: string]: any });
        
        setTranslations(translationsData);
      } catch (error) {
        console.error("Failed to load translation files", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllTranslations();
  }, []); // Empty dependency array ensures this runs only once on mount

  const t = useCallback((key: string, replacements?: { [key: string]: string | number | null }): string => {
    const currentTranslations = translations[language];
    if (!currentTranslations) {
      return key; // Return key if translations for the current language are not loaded
    }
    
    let translation = getNestedTranslation(currentTranslations, key);

    if (replacements) {
      Object.keys(replacements).forEach(placeholder => {
        translation = translation.replace(`{${placeholder}}`, String(replacements[placeholder]));
      });
    }
    return translation;
  }, [language, translations]);
  
  // Render nothing until translations are loaded to prevent FOUC (Flash of Untranslated Content)
  if (isLoading) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
