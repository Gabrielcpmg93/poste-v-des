
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
  // Ensure the API key is available before creating a new instance
  // This helps mitigate race conditions where the key might be updated via window.aistudio.openSelectKey()
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
    // If the error indicates a missing API key or billing issue, rethrow a specific error
    if (error instanceof Error && error.message.includes("Requested entity was not found.")) {
      throw new Error(`API Key error: Please select a valid API key with billing enabled. See ${API_KEY_BILLING_URL}`);
    }
    throw new Error('Failed to generate video caption. Please try again.');
  }
}

/**
 * Checks if an API key has been selected and opens the selection dialog if not.
 * @returns A promise that resolves when the API key is confirmed to be selected.
 * @throws An error if window.aistudio is not available.
 */
export async function ensureApiKeySelected(): Promise<void> {
  if (typeof window.aistudio === 'undefined') {
    console.warn('window.aistudio is not available. API key selection cannot be managed automatically.');
    // In a real scenario, you might want to stop here or provide manual instructions.
    return;
  }

  const hasKey = await window.aistudio.hasSelectedApiKey();
  if (!hasKey) {
    await window.aistudio.openSelectKey();
    // Assume selection was successful after triggering openSelectKey()
    console.log("User prompted to select API key. Proceeding assuming selection.");
  }
}