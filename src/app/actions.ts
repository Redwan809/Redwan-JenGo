
"use server";

import generalIntents from "@/lib/intents/general.json";
import socialIntents from "@/lib/intents/social.json";
import { calculateExpression } from "@/lib/math-parser";
import { getSituationalResponse } from "@/lib/situational-logic";
import type { Message } from "@/components/chat/ChatLayout";

type Intent = {
  tag: string;
  patterns: string[];
  responses: string[];
};

type IntentData = {
  intents: Intent[];
};

const allIntents: Intent[] = [
  ...(generalIntents as IntentData).intents,
  ...(socialIntents as IntentData).intents,
];

/**
 * Fetches an AI response based on user input and conversation context.
 * 1. Checks for situational responses based on conversation history.
 * 2. Tries to solve a math expression.
 * 3. Looks for a matching intent.
 * 4. Returns a default fallback message.
 * @param userInput The message from the user.
 * @param history The entire chat history.
 * @returns A promise that resolves to the AI's response string.
 */
export async function getAiResponse(userInput: string, history: Message[]): Promise<string> {
  const cleanedInput = userInput.trim().toLowerCase().replace(/[?.,!]/g, '');

  // 1. Check for situational/contextual responses first
  const situationalResponse = getSituationalResponse(cleanedInput, history);
  if (situationalResponse) {
    return situationalResponse;
  }

  // 2. Try to solve as a math problem
  try {
    const mathResult = calculateExpression(cleanedInput);
    if (mathResult !== null) {
      return mathResult.toString();
    }
  } catch (error) {
    // Not a valid math expression, so we continue to intents
  }

  // 3. If not a math problem, check for general intents
  for (const intent of allIntents) {
    for (const pattern of intent.patterns) {
      // Use includes for broader matching
      if (cleanedInput.includes(pattern.toLowerCase())) {
        const responses = intent.responses;
        return responses[Math.floor(Math.random() * responses.length)];
      }
    }
  }

  // 4. If no intent is matched, return a default message
  return "দুঃখিত, আমি আপনার কথা বুঝতে পারিনি। 😕 আমাকে অন্যভাবে জিজ্ঞেস করতে পারেন?";
}
