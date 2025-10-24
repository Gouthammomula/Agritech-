import React from 'react';
import { CropAnalysis } from '../types';
import HealthIcon from './icons/HealthIcon';
import WarningIcon from './icons/WarningIcon';
import { useLanguage } from '../contexts/LanguageContext';

interface ResultCardProps {
  result: CropAnalysis;
}

const getBadgeStyle = (type: string) => {
    switch (type) {
        case 'Organic':
            return {
                badge: 'bg-green-100 text-green-800',
                border: 'border-green-500',
            };
        case 'Chemical':
            return {
                badge: 'bg-yellow-100 text-yellow-800',
                border: 'border-yellow-500',
            };
        case 'Preventive':
            return {
                badge: 'bg-blue-100 text-blue-800',
                border: 'border-blue-500',
            };
        default:
            return {
                badge: 'bg-gray-100 text-gray-800',
                border: 'border-gray-500',
            };
    }
};

const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const { t, language } = useLanguage();

  const translatedDescription =
    result.description[language as keyof typeof result.description] || result.description.en;

  const headerBgClass = result.isHealthy 
    ? 'from-green-500 to-green-600' 
    : 'from-orange-500 to-red-600';

  return (
    <div className="w-full animate-fade-in max-h-[70vh] overflow-y-auto pr-2">
        <div className={`p-4 rounded-t-lg flex items-center space-x-4 bg-gradient-to-r ${headerBgClass} text-white shadow-md`}>
            <div className="flex-shrink-0">
              {result.isHealthy ? <HealthIcon /> : <WarningIcon />}
            </div>
            <div>
              <h3 className="text-xl font-bold">
                {result.isHealthy ? t('resultCard.healthy') : t('resultCard.diseaseDetected', { diseaseName: result.diseaseName })}
              </h3>
            </div>
        </div>
        
        <div className="bg-white p-5 rounded-b-lg shadow-md border-x border-b border-gray-200 space-y-6">
            <section>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">{t('resultCard.description')}</h4>
                <p className="text-gray-600 leading-relaxed">{translatedDescription}</p>
            </section>
            
            {!result.isHealthy && result.potentialCauses && result.potentialCauses.length > 0 && (
              <section>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">{t('resultCard.potentialCauses')}</h4>
                  <ul className="list-disc list-inside space-y-1.5 text-gray-600 pl-2">
                      {result.potentialCauses.map((cause, index) => <li key={index}>{cause}</li>)}
                  </ul>
              </section>
            )}

            {result.suggestedRemedies && result.suggestedRemedies.length > 0 && (
              <section>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">{t('resultCard.suggestedRemedies')}</h4>
                  <div className="space-y-4">
                      {result.suggestedRemedies.map((remedy, index) => {
                          const { badge, border } = getBadgeStyle(remedy.type);
                          return (
                            <div key={index} className={`bg-gray-50/50 rounded-lg p-4 border-l-4 ${border}`}>
                                <div className="flex justify-between items-start mb-1">
                                    <h5 className="font-bold text-gray-800 pr-2">{remedy.title}</h5>
                                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${badge} flex-shrink-0`}>
                                        {t(`resultCard.remedyTypes.${remedy.type}` as const)}
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm">{remedy.details}</p>
                            </div>
                          )
                      })}
                  </div>
              </section>
            )}
        </div>
    </div>
  );
};

export default ResultCard;