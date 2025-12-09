
"use server";

import intents from '@/lib/intents.json';

type Intent = {
  tag: string;
  patterns: string[];
  responses: string[];
};

const intentData: { intents: Intent[] } = intents;

/**
 * Simulates fetching an AI response based on user input.
 * @param userInput The message from the user.
 * @returns A promise that resolves to the AI's response string.
 */
export async function getAiResponse(userInput: string): Promise<string> {
  // Simulate network/processing delay to mimic AI thinking time.
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Remove punctuation from the end of the input and trim whitespace.
  const lowerText = userInput.toLowerCase().replace(/[.,!?;:\"']$/, "").trim();

  for (const intent of intentData.intents) {
    for (const pattern of intent.patterns) {
      if (lowerText.includes(pattern.toLowerCase())) {
        const responses = intent.responses;
        return responses[Math.floor(Math.random() * responses.length)];
      }
    }
  }

  // A default response in Bengali if no intent is matched.
  return "দুঃখিত, আমি আপনার কথা বুঝতে পারিনি। 😕 আমাকে অন্যভাবে জিজ্ঞেস করতে পারেন?";
}
