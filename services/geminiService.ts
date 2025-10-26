
import { GoogleGenAI, Modality } from "@google/genai";
import type { InputImage } from '../types';

const MODEL_NAME = 'gemini-2.5-flash-image';

export async function generateOrEnhanceImage(
  prompt: string,
  inputImage: InputImage | null
): Promise<string> {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const parts = [];
  
  if (inputImage) {
    parts.push({
      inlineData: {
        data: inputImage.base64,
        mimeType: inputImage.mimeType,
      },
    });
  }

  parts.push({
    text: prompt,
  });

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: parts,
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    
    throw new Error("No image data found in the API response.");
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate or enhance image. Please check the console for more details.");
  }
}
