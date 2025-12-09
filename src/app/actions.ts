
"use server";

// The GenAI flow import is kept for future expandability, as requested.
// import { generateAIChatResponse } from '@/ai/flows/generate-ai-chat-response';

/**
 * Simulates fetching an AI response based on user input.
 * @param userInput The message from the user.
 * @returns A promise that resolves to the AI's response string.
 */
export async function getAiResponse(userInput: string): Promise<string> {
  // Simulate network/processing delay to mimic AI thinking time.
  await new Promise(resolve => setTimeout(resolve, 2000));

  const lowerText = userInput.toLowerCase().trim();

  if (lowerText === "hi") {
    return "Hi";
  } else if (lowerText === "hello") {
    return "Hello";
  } else {
    // As per the user's original JavaScript, the default response is "No".
    // This part can be easily replaced with a call to a real GenAI flow.
    /*
    try {
      const result = await generateAIChatResponse({ message: userInput });
      return result.response;
    } catch (error) {
      console.error("AI response generation failed:", error);
      return "Sorry, I encountered an error. Please try again.";
    }
    */
    return "No";
  }
}
