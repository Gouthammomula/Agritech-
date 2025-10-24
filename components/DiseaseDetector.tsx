import React, { useState, useCallback, useRef } from 'react';
import { analyzeCropDisease } from '../services/geminiService';
import { CropAnalysis } from '../types';
import ResultCard from './ResultCard';
import Spinner from './Spinner';
import UploadIcon from './icons/UploadIcon';
import CameraIcon from './icons/CameraIcon';
import { useLanguage } from '../contexts/LanguageContext';

const DiseaseDetector: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<CropAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };
  
  const processFile = (file: File) => {
    setSelectedFile(file);
    setAnalysisResult(null);
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  const handleAnalysis = useCallback(async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeCropDisease(selectedFile);
      setAnalysisResult(result);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile]);

  const resetState = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setAnalysisResult(null);
    setError(null);
    setIsLoading(false);
    if(fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragEvents = (e: React.DragEvent<HTMLLabelElement>, isOver: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(isOver);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    handleDragEvents(e, false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
        processFile(file);
    }
  };
  
  return (
    <div className="bg-white/60 backdrop-blur-xl p-6 md:p-8 rounded-2xl shadow-lg w-full max-w-5xl mx-auto border border-gray-200/80 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight">{t('detector.title')}</h2>
        <p className="text-gray-600 mt-2 max-w-2xl mx-auto">{t('detector.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="flex flex-col items-center space-y-4">
            <label 
              htmlFor="crop-image-upload" 
              className={`w-full h-80 border-2 border-dashed rounded-xl flex flex-col justify-center items-center cursor-pointer transition-all duration-300 relative overflow-hidden group ${isDragOver ? 'border-green-500 bg-green-100 scale-105 shadow-md' : 'border-gray-300 hover:border-green-500 hover:bg-green-50'}`}
              onDragEnter={(e) => handleDragEvents(e, true)}
              onDragOver={(e) => handleDragEvents(e, true)}
              onDragLeave={(e) => handleDragEvents(e, false)}
              onDrop={handleDrop}
            >
                {imagePreview ? (
                    <img src={imagePreview} alt="Crop preview" className="w-full h-full object-cover rounded-xl" />
                ) : (
                    <div className="text-center text-gray-500 p-4">
                        <UploadIcon />
                        <p className="mt-2 font-semibold text-lg">{t('detector.uploadArea.clickToUpload')}</p>
                        <p className="text-sm">{t('detector.uploadArea.dragAndDrop')}</p>
                        <p className="text-xs text-gray-400 mt-1">{t('detector.uploadArea.fileTypes')}</p>
                    </div>
                )}
            </label>
            <input ref={fileInputRef} id="crop-image-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
            <div className="w-full grid grid-cols-2 gap-4">
                <button 
                  onClick={handleAnalysis} 
                  disabled={isLoading || !selectedFile}
                  className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:shadow-none transform hover:-translate-y-0.5 disabled:transform-none">
                    <CameraIcon />
                    <span>{isLoading ? t('detector.buttons.analyzing') : t('detector.buttons.analyze')}</span>
                </button>
                <button 
                  onClick={resetState} 
                  disabled={isLoading}
                  className="w-full bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-colors disabled:opacity-50">
                    <span>{t('detector.buttons.clear')}</span>
                </button>
            </div>
        </div>

        <div className="min-h-[22rem] flex flex-col justify-center items-center p-4 bg-gray-50/80 rounded-xl border">
          {isLoading && <Spinner />}
          {error && <div className="text-red-600 bg-red-100 border border-red-200 p-4 rounded-lg text-center w-full"><strong>{t('detector.status.error')}</strong> {error}</div>}
          {analysisResult && <ResultCard result={analysisResult} />}
          {!isLoading && !error && !analysisResult && (
              <div className="text-center text-gray-500 p-8">
                  <p className="font-medium text-lg">{t('detector.status.placeholderTitle')}</p>

                  <p className="text-sm mt-1">{t('detector.status.placeholderSubtitle')}</p>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetector;