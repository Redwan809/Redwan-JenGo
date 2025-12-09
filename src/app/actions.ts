"use server";

import generalIntents from "@/lib/intents/general.json";
import socialIntents from "@/lib/intents/social.json";
import identityIntents from "@/lib/intents/identity.json";
import emojiIntents from "@/lib/intents/emoji.json";
import knowledgeIntents from "@/lib/intents/knowledge.json";
import historyIntents from "@/lib/intents/history.json";
import scienceIntents from "@/lib/intents/science.json";
import creativeIntents from "@/lib/intents/creative.json";
import abuseIntents from "@/lib/intents/abuse.json";
import dictionaryData from "@/lib/dictionary.json";
import { calculateExpression } from "@/lib/math-parser";
import { getSituationalResponse } from "@/lib/situational-logic";
import type { Message } from "@/components/chat/ChatLayout";

// --- Types ---
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

// --- Data Aggregation ---
const allIntents: Intent[] = [
  ...(generalIntents as IntentData).intents,
  ...(socialIntents as IntentData).intents,
  ...(identityIntents as IntentData).intents,
  ...(emojiIntents as IntentData).intents,
  ...(knowledgeIntents as IntentData).intents,
  ...(historyIntents as IntentData).intents,
  ...(scienceIntents as IntentData).intents,
  ...(creativeIntents as IntentData).intents,
  ...(abuseIntents as IntentData).intents,
];

/**
 * Smart Dictionary Search
 * Handles: "Meaning of X", "X mane ki", "X er ortho", "Bangla of X"
 */
function searchDictionary(input: string): string | null {
  const dictionary: DictionaryEntry[] = dictionaryData.dictionary;
  const lowerInput = input.toLowerCase();

  // Regex to find the word, trying different patterns.
  const matchPattern1 = lowerInput.match(/(?:what is the meaning of|meaning of|what is)\s*([a-zA-Z]+)/i);
  const matchPattern2 = lowerInput.match(/^(.*?)\s*(?:mane ki|er ortho ki|ortho ki|er bangla ki|bangla ki|মানে কি|এর অর্থ কি|এর বাংলা কি)/i);
  
  let wordToFind = "";

  if (matchPattern1 && matchPattern1[1]) {
    wordToFind = matchPattern1[1].trim();
  } else if (matchPattern2 && matchPattern2[1]) {
    wordToFind = matchPattern2[1].trim();
  } else if (input.trim().split(/\s+/).length === 1) { // Fallback for a single word
    wordToFind = input.trim();
  }
  
  if (!wordToFind) return null;

  const entry = dictionary.find(d => d.en.toLowerCase() === wordToFind.toLowerCase());

  if (entry) {
    return `"${entry.en}" এর বাংলা অর্থ হলো "${entry.bn}"।`;
  }

  return null;
}

/**
 * Finds a matching intent from the provided list by checking if the input includes the pattern.
 */
function findIntent(cleanedInput: string): Intent | null {
    for (const intent of allIntents) {
        for (const pattern of intent.patterns) {
            // Use a simple `includes` check for broader matching.
            if (cleanedInput.includes(pattern.toLowerCase())) {
                return intent;
            }
        }
    }
    return null;
}


// --- Main Action Function ---

/**
 * Fetches an AI response with a simplified and more direct logic.
 */
export async function getAiResponse(userInput: string, history: Message[]): Promise<string> {
  const normalizedInput = userInput.trim().toLowerCase().replace(/ø/g, 'o');
  const cleanedInput = normalizedInput.replace(/[?.,!]/g, '');

  // Priority 1: Math Check
  try {
    const mathResult = calculateExpression(cleanedInput);
    if (mathResult !== null) {
      return `ফলাফল: ${mathResult}`;
    }
  } catch (error) {
    // Not a math expression, ignore and continue.
  }

  // Priority 2: Dictionary Check
  const dictionaryResponse = searchDictionary(cleanedInput);
  if (dictionaryResponse) {
    return dictionaryResponse;
  }

  // Priority 3: Situational Logic (Context-Aware)
  const situationalResponse = getSituationalResponse(cleanedInput, history);
  if (situationalResponse) {
    return situationalResponse;
  }

  // Priority 4: General Intent Matching
  const matchedIntent = findIntent(cleanedInput);
  if (matchedIntent) {
    const responses = matchedIntent.responses;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Priority 5: Fallback Default
  return "দুঃখিত, আমি আপনার কথা ঠিক বুঝতে পারিনি। 😕 দয়া করে একটু সহজভাবে বা অন্যভাবে জিজ্ঞেস করবেন?";
}
