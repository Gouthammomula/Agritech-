
export interface CropAnalysis {
  isHealthy: boolean;
  diseaseName: string | null;
  description: {
    en: string;
    hi: string;
    ta: string;
    bn: string;
  };
  potentialCauses: string[];
  suggestedRemedies: {
    title: string;
    details: string;
    type: 'Organic' | 'Chemical' | 'Preventive';
  }[];
}