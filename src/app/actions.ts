
"use server";

import generalIntents from "@/lib/intents/general.json";
import socialIntents from "@/lib/intents/social.json";
import { calculateExpression } from "@/lib/math-parser";

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
 * Fetches an AI response based on user input.
 * It first tries to solve a math expression. If it's not a math expression,
 * it looks for a matching intent.
 * @param userInput The message from the user.
 * @returns A promise that resolves to the AI's response string.
 */
export async function getAiResponse(userInput: string): Promise<string> {
  const cleanedInput = userInput.trim().toLowerCase().replace(/[?.,!]/g, '');

  // 1. Try to solve as a math problem first
  try {
    const mathResult = calculateExpression(cleanedInput);
    if (mathResult !== null) {
      return mathResult.toString();
    }
  } catch (error) {
    // Not a valid math expression, so we continue to intents
  }

  // 2. If not a math problem, check for intents
  for (const intent of allIntents) {
    for (const pattern of intent.patterns) {
      if (cleanedInput.includes(pattern.toLowerCase())) {
        const responses = intent.responses;
        return responses[Math.floor(Math.random() * responses.length)];
      }
    }
  }

  // 3. If no intent is matched, return a default message
  return "দুঃখিত, আমি আপনার কথা বুঝতে পারিনি। 😕 আমাকে অন্যভাবে জিজ্ঞেস করতে পারেন?";
}
