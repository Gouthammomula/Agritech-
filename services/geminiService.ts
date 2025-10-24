import { GoogleGenAI, Type } from "@google/genai";
import { CropAnalysis } from '../types';

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        resolve('');
      }
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const analyzeCropDisease = async (imageFile: File): Promise<CropAnalysis> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const imagePart = await fileToGenerativePart(imageFile);

  const prompt = `
    You are an expert agricultural scientist and plant pathologist.
    Analyze the provided image of a plant leaf.
    Based on your analysis, provide a detailed diagnosis in JSON format.
    If the plant appears healthy, indicate that, and set diseaseName to null.
    If a disease or pest is detected, identify it, list potential causes, and suggest at least three detailed remedies (one organic, one chemical, one preventive if possible).
    
    IMPORTANT: Provide the 'description' field as an object containing translations in English (en), Hindi (hi), Tamil (ta), and Bengali (bn). The description should explain the disease or the health status of the plant.
    All other text fields (diseaseName, potentialCauses, remedy titles and details) should be in English.

    Your response MUST conform to the provided JSON schema.
  `;
  
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      isHealthy: { type: Type.BOOLEAN },
      diseaseName: { type: Type.STRING },
      description: {
        type: Type.OBJECT,
        properties: {
          en: { type: Type.STRING, description: "Description in English." },
          hi: { type: Type.STRING, description: "Description in Hindi." },
          ta: { type: Type.STRING, description: "Description in Tamil." },
          bn: { type: Type.STRING, description: "Description in Bengali." },
        },
        required: ['en', 'hi', 'ta', 'bn']
      },
      potentialCauses: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
      suggestedRemedies: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            details: { type: Type.STRING },
            type: { type: Type.STRING, enum: ['Organic', 'Chemical', 'Preventive'] }
          },
          required: ['title', 'details', 'type']
        }
      }
    },
    required: ['isHealthy', 'description', 'potentialCauses', 'suggestedRemedies']
  };

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
          parts: [
              {text: prompt},
              imagePart
          ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const jsonString = result.text.trim();
    return JSON.parse(jsonString) as CropAnalysis;
  } catch (error: any) {
    console.error("Error analyzing crop disease:", error);
    const errorMessage = error.message || "Failed to get analysis from AI. The model may be unable to process this image.";
    throw new Error(errorMessage);
  }
};