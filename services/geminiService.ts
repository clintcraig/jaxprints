import { GoogleGenAI, Modality } from "@google/genai";
import type { RestorationOptions, TarpDesignOptions } from '../types';

// IMPORTANT: Assumes process.env.API_KEY is set in the environment
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you might want to handle this more gracefully.
  // For this context, we'll throw an error if the key is missing.
  throw new Error("Missing Google Gemini API Key. Please set process.env.API_KEY.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

function fileToGenerativePart(base64: string, mimeType: string) {
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  };
}

export const restorePhoto = async (
  base64Image: string,
  mimeType: string,
  options: RestorationOptions
): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash-image-preview';

    const actions = Object.entries(options)
      .filter(([, value]) => value)
      .map(([key]) => {
        if (key === 'restoreFace') return 'restore faces with high fidelity';
        if (key === 'colorize') return 'colorize the photo realistically';
        if (key === 'upscale') return 'upscale the image to a higher resolution (e.g., 2x or 4x)';
        if (key === 'cleanNoise') return 'clean noise, remove scratches, and fix minor damage';
        return '';
      })
      .filter(Boolean);

    if (actions.length === 0) {
      throw new Error("Please select at least one restoration option.");
    }
    
    const prompt = `You are a professional photo restoration expert. Please process this image with the following actions: ${actions.join(', ')}. Return only the restored image without any additional text or commentary.`;

    const imagePart = fileToGenerativePart(base64Image, mimeType);
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [imagePart, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }

    throw new Error("The AI did not return a restored image. Please try again.");

  } catch (error) {
    console.error("Error during photo restoration:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred with the Gemini API.";
    // Check for specific safety-related blocks
    if (errorMessage.includes('finishReason: SAFETY')) {
        return Promise.reject("The image could not be processed due to safety policies. Please try a different image.");
    }
    return Promise.reject(`Error: ${errorMessage}`);
  }
};

export const generateTarpDesign = async (options: TarpDesignOptions): Promise<string> => {
  try {
    const { name, age, theme, orientation } = options;
    const model = 'imagen-4.0-generate-001';

    const prompt = `Create a high-resolution birthday tarpaulin design with a ${orientation} orientation for a child named "${name}" for their ${age} birthday. The theme should be "${theme}". The design must be vibrant, high-quality, celebratory, and visually appealing for a birthday party. Importantly, the text "${name}" and "${age} Birthday" must be integrated beautifully and legibly into the design as the main focus. Do not include any other text unless it's part of the theme's style (like comic book sounds for a superhero theme).`;
    
    const response = await ai.models.generateImages({
      model: model,
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: orientation === 'Portrait' ? '9:16' : '16:9',
      },
    });
    
    const generatedImage = response.generatedImages?.[0]?.image?.imageBytes;

    if (!generatedImage) {
      throw new Error("The AI did not return a design. This could be due to a safety policy violation or an issue with the prompt. Please try a different theme.");
    }

    return generatedImage;

  } catch (error) {
    console.error("Error during tarpaulin design generation:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred with the Gemini API.";
     if (errorMessage.includes('SAFETY')) {
        return Promise.reject("The design could not be generated due to safety policies. Please try a different theme.");
    }
    return Promise.reject(`Error: ${errorMessage}`);
  }
};