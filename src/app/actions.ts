
"use server";

import { generateAIChatResponse } from "@/ai/flows/generate-ai-chat-response";

/**
 * Fetches an AI response based on user input using a Genkit flow.
 * @param userInput The message from the user.
 * @returns A promise that resolves to the AI's response string.
 */
export async function getAiResponse(userInput: string): Promise<string> {
  // Use a proper AI model to generate a response.
  const aiResponse = await generateAIChatResponse({ message: userInput });
  return aiResponse.response;
}
