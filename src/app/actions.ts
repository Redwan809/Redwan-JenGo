
"use server";

import generalIntents from "@/lib/intents/general.json";
import socialIntents from "@/lib/intents/social.json";
import identityIntents from "@/lib/intents/identity.json";
import dictionaryData from "@/lib/dictionary.json";
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

type DictionaryEntry = {
  en: string;
  bn: string;
};

const allIntents: Intent[] = [
  ...(generalIntents as IntentData).intents,
  ...(socialIntents as IntentData).intents,
  ...(identityIntents as IntentData).intents,
];

/**
 * Fetches an AI response based on user input and conversation context.
 * 1. Tries to solve a math expression.
 * 2. Tries to find a dictionary definition.
 * 3. Checks for situational responses based on conversation history.
 * 4. Looks for a matching intent.
 * 5. Returns a default fallback message.
 * @param userInput The message from the user.
 * @param history The entire chat history.
 * @returns A promise that resolves to the AI's response string.
 */
export async function getAiResponse(userInput: string, history: Message[]): Promise<string> {
  const cleanedInput = userInput.trim().toLowerCase().replace(/[?.,!]/g, '');

  // 1. Try to solve as a math problem first, as it's more specific.
  try {
    const mathResult = calculateExpression(cleanedInput);
    if (mathResult !== null) {
      return mathResult.toString();
    }
  } catch (error) {
    // Not a valid math expression, so we continue
  }

  // 2. Check for dictionary queries
  const dictionaryMatch = cleanedInput.match(/(?:what is the meaning of|meaning of|ortho ki|অর্থ কী|meaning ki|এর মানে কি|এর বাংলা কি)\s*(\w+)/) || cleanedInput.match(/(\w+)\s*(?:er ortho ki|'s meaning|ortho ki|এর অর্থ কী|অর্থ কী|meaning ki| माने की| বাংলা কি|er bangla meaning ki)/);
  if (dictionaryMatch) {
    const wordToFind = dictionaryMatch[1];
    const dictionary: DictionaryEntry[] = dictionaryData.dictionary;
    const foundWord = dictionary.find(entry => entry.en.toLowerCase() === wordToFind);
    if (foundWord) {
      return `"${foundWord.en}" এর অর্থ হলো "${foundWord.bn}"।`;
    }
  }

  // 3. Check for situational/contextual responses
  const situationalResponse = getSituationalResponse(cleanedInput, history);
  if (situationalResponse) {
    return situationalResponse;
  }

  // 4. If not a math problem or situational, check for general intents
  for (const intent of allIntents) {
    for (const pattern of intent.patterns) {
      // Use includes for broader matching
      if (cleanedInput.includes(pattern.toLowerCase())) {
        const responses = intent.responses;
        return responses[Math.floor(Math.random() * responses.length)];
      }
    }
  }

  // 5. If no intent is matched, return a default message
  return "দুঃখিত, আমি আপনার কথা বুঝতে পারিনি। 😕 আমাকে অন্যভাবে জিজ্ঞেস করতে পারেন?";
}
