
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { API_KEY_BILLING_URL } from "../constants";

interface GenerateCaptionOptions {
  videoDescription: string;
}

/**
 * Generates a video caption using the Gemini API based on a user-provided description.
 * @param options - The options for caption generation.
 * @returns A promise that resolves to the generated caption string.
 * @throws An error if the API call fails or the response is empty.
 */
export async function generateVideoCaption(
  options: GenerateCaptionOptions,
): Promise<string> {
  // Create a new GoogleGenAI instance right before making an API call to ensure it always uses the most up-to-date API key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  if (!options.videoDescription) {
    throw new Error('Video description is required to generate a caption.');
  }

  const prompt = `Generate a short, catchy, and engaging caption for a video based on the following description. Keep it under 20 words and include relevant emojis, if appropriate.
  
  Video description: "${options.videoDescription}"
  
  Example: "Epic adventure awaits! 🚀🌲 #travel #explore"
  Caption:`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Using gemini-2.5-flash for text tasks
      contents: prompt,
      config: {
        maxOutputTokens: 60, // Limit output to a reasonable length for a caption
        temperature: 0.7,
        topP: 0.95,
        topK: 64,
      },
    });

    const caption = response.text?.trim();

    if (!caption) {
      throw new Error('Gemini API did not return a caption.');
    }

    return caption;
  } catch (error) {
    console.error('Error generating video caption with Gemini:', error);
    // Generic error handling, as API key selection is assumed to be handled externally.
    throw new Error('Failed to generate video caption. Please try again.');
  }
}

// The API key selection functionality (ensureApiKeySelected) is removed as
// per the guidelines: "The API key must be obtained exclusively from the
// environment variable process.env.API_KEY. Assume this variable is
// pre-configured, valid, and accessible."
// The application must not ask the user for it under any circumstances.
export async function ensureApiKeySelected(): Promise<void> {
  console.warn('API key selection is now handled externally. ensureApiKeySelected is deprecated and will not perform any action.');
  return Promise.resolve();
}