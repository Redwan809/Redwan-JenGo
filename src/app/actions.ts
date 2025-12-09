
"use server";

import generalIntents from "@/lib/intents/general.json";
import socialIntents from "@/lib/intents/social.json";
import identityIntents from "@/lib/intents/identity.json";
import emojiIntents from "@/lib/intents/emoji.json";
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
];

// --- Utility Functions for "Ultra Advanced" Logic ---

/**
 * Calculates the Levenshtein distance between two strings.
 * Used for fuzzy matching (handling typos).
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculates a similarity score (0 to 1) between two strings.
 * 1 = Exact match, 0 = No match.
 */
function getSimilarity(s1: string, s2: string): number {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  const longerLength = longer.length;

  if (longerLength === 0) {
    return 1.0;
  }

  return (longerLength - levenshteinDistance(longer, shorter)) / longerLength;
}

/**
 * Smart Dictionary Search
 * Handles: "Meaning of X", "X mane ki", "X er ortho", "Bangla of X"
 */
function searchDictionary(input: string): string | null {
  const dictionary: DictionaryEntry[] = dictionaryData.dictionary;
  const lowerInput = input.toLowerCase();

  // Regex strategies to extract the target word
  // Strategy 1: Word at the start (e.g., "Done mane ki", "Apple er ortho")
  const suffixMatch = lowerInput.match(/^([a-zA-Z]+)\s+(?:mane|ortho|bhab|means|meaning|er bangla|bangle)/i);
  
  // Strategy 2: Word at the end (e.g., "mane ki Done", "ortho ki Apple")
  const prefixMatch = lowerInput.match(/(?:mane ki|ortho ki|meaning of|what is|bangla ki)\s+([a-zA-Z]+)/i);

  // Strategy 3: Direct word lookup if input is just one word
  const exactWord = input.trim().split(/\s+/).length === 1 ? input.trim() : null;

  let wordToFind = "";

  if (suffixMatch && suffixMatch[1]) {
    wordToFind = suffixMatch[1];
  } else if (prefixMatch && prefixMatch[1]) {
    wordToFind = prefixMatch[1];
  } else if (exactWord) {
    wordToFind = exactWord;
  }

  if (!wordToFind) return null;

  // Search in Dictionary (Exact match first, then Fuzzy)
  // 1. Exact English Match
  let entry = dictionary.find(d => d.en.toLowerCase() === wordToFind.toLowerCase());
  
  // 2. Exact Bengali Match
  if (!entry) {
    entry = dictionary.find(d => d.bn === wordToFind);
  }

  // 3. Fuzzy Match (If typo exists, e.g., "Dne" instead of "Done")
  if (!entry) {
    const bestMatch = dictionary.reduce((best, current) => {
      const score = getSimilarity(current.en.toLowerCase(), wordToFind.toLowerCase());
      return score > best.score ? { entry: current, score } : best;
    }, { entry: null as DictionaryEntry | null, score: 0 });

    // Accept fuzzy match only if confidence is > 70%
    if (bestMatch.score > 0.7) {
      entry = bestMatch.entry;
    }
  }

  if (entry) {
    // If user typed Bengali, show English. If user typed English, show Bengali.
    if (entry.bn === wordToFind) {
      return `"${entry.bn}" এর ইংরেজি হলো "${entry.en}"।`;
    }
    return `"${entry.en}" এর বাংলা অর্থ হলো "${entry.bn}"।`;
  }

  return null;
}

// --- Main Action Function ---

/**
 * Fetches an AI response with Advanced Logic.
 */
export async function getAiResponse(userInput: string, history: Message[]): Promise<string> {
  const cleanedInput = userInput.trim().toLowerCase().replace(/[?.,!]/g, '');

  // 1. Math Check (Highest Priority)
  try {
    const mathResult = calculateExpression(cleanedInput);
    if (mathResult !== null) {
      return `ফলাফল: ${mathResult}`;
    }
  } catch (error) {
    // Ignore math errors
  }

  // 2. Dictionary Check (Improved Logic)
  const dictionaryResponse = searchDictionary(cleanedInput);
  if (dictionaryResponse) {
    return dictionaryResponse;
  }

  // 3. Situational Logic (Context Aware)
  const situationalResponse = getSituationalResponse(cleanedInput, history);
  if (situationalResponse) {
    return situationalResponse;
  }

  // 4. Advanced Intent Matching (Fuzzy Score Based)
  let bestMatch = {
    intent: null as Intent | null,
    score: 0
  };

  for (const intent of allIntents) {
    for (const pattern of intent.patterns) {
      const patternLower = pattern.toLowerCase();
      
      // Calculate Match Score
      let score = 0;

      // A. Exact Include (Base score)
      if (cleanedInput.includes(patternLower)) {
        score = 0.8; // High base score for inclusion
        
        // Boost score if lengths are similar (meaning less garbage text)
        const lengthRatio = Math.min(cleanedInput.length, patternLower.length) / Math.max(cleanedInput.length, patternLower.length);
        score += lengthRatio * 0.2; // Max 1.0
      } 
      // B. Fuzzy Similarity (Handle Typos)
      else {
        const similarity = getSimilarity(cleanedInput, patternLower);
        if (similarity > 0.65) { // Threshold for fuzzy match
          score = similarity;
        }
      }

      // Update Best Match
      if (score > bestMatch.score) {
        bestMatch = { intent, score };
      }
    }
  }

  // Return the best matching intent if confidence is high enough
  // Threshold 0.6 means we are 60% sure
  if (bestMatch.intent && bestMatch.score > 0.6) {
    const responses = bestMatch.intent.responses;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // 5. Fallback Default
  return "দুঃখিত, আমি আপনার কথা ঠিক বুঝতে পারিনি। 😕 দয়া করে একটু সহজভাবে বা অন্যভাবে জিজ্ঞেস করবেন?";
}

    