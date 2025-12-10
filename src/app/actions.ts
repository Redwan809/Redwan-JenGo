"use server";

// ১. সব JSON ফাইল ইম্পোর্ট করা হচ্ছে
import generalIntents from "@/lib/intents/general.json";
import socialIntents from "@/lib/intents/social.json";
import identityIntents from "@/lib/intents/identity.json";
import emojiIntents from "@/lib/intents/emoji.json";
import knowledgeIntents from "@/lib/intents/knowledge.json";
import historyIntents from "@/lib/intents/history.json";
import scienceIntents from "@/lib/intents/science.json";
import creativeIntents from "@/lib/intents/creative.json";
import abuseIntents from "@/lib/intents/abuse.json";
import banglaMeaningData from "@/lib/intents/bangla-meaning.json";

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

// --- ২. সব ফাইলের ডাটা এক জায়গায় (allIntents) জমা করা হচ্ছে ---
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

// --- Helper Functions ---

/**
 * বাংলা টেক্সট নরমালাইজ করার ফাংশন
 * এটি বিভিন্ন ধরনের 'য়', 'ড়', 'ঢ়' কে একটি স্ট্যান্ডার্ড ফর্মে নিয়ে আসে।
 */
function normalizeText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/য়/g, 'য়') // Normalize Ya
    .replace(/ড়/g, 'ড়') // Normalize Ra
    .replace(/ঢ়/g, 'ঢ়') // Normalize Rha
    .replace(/ø/g, 'o')
    .replace(/[?.,!৷।]/g, '') // বিরাম চিহ্ন রিমুভ (বাংলা দাঁড়ি সহ)
    .replace(/\s+/g, ' '); // অতিরিক্ত স্পেস রিমুভ
}

/**
 * ডিকশনারি বা শব্দার্থ খোঁজার ফাংশন
 */
function searchDictionary(input: string): string | null {
  const dictionary: DictionaryEntry[] = (banglaMeaningData as { dictionary: DictionaryEntry[] }).dictionary;
  
  // ডিকশনারির জন্য সাধারণ ক্লিনআপ
  const lowerInput = input.trim().toLowerCase().replace(/[?.,!]/g, '');

  const patterns = [
    /^(?:what is the meaning of|meaning of|what is)\s+([a-zA-Z]+)/i, 
    /^([a-zA-Z]+)\s+(?:mane ki|er ortho ki|ortho ki|er bangla ki|bangla ki|মানে কি|এর অর্থ কি|এর বাংলা কি)/i,
  ];
  
  let wordToFind = "";

  for (const regex of patterns) {
    const match = lowerInput.match(regex);
    if (match && match[1]) {
      wordToFind = match[1].trim();
      break;
    }
  }

  if (!wordToFind && lowerInput.split(/\s+/).length === 1 && /^[a-z]+$/.test(lowerInput)) { 
    wordToFind = lowerInput;
  }
  
  if (!wordToFind) return null;

  const entry = dictionary.find(d => d.en.toLowerCase() === wordToFind);

  if (entry) {
    return `"${entry.en}"-এর বাংলা অর্থ হলো "${entry.bn}"।`;
  }

  return null;
}

/**
 * ৩. ইনটেন্ট খোঁজার ফাংশন (Pattern Matching)
 */
function findIntent(normalizedInput: string): Intent | null {
  for (const intent of allIntents) {
    for (const pattern of intent.patterns) {
      // প্যাটার্নগুলোকেও নরমালাইজ করে নিচ্ছি যাতে ম্যাচিং সঠিক হয়
      const normalizedPattern = normalizeText(pattern);
      
      // ইনপুটের মধ্যে প্যাটার্নটি আছে কিনা চেক করা হচ্ছে
      // This is the most reliable simple check.
      if (normalizedInput.includes(normalizedPattern)) {
        return intent;
      }
    }
  }
  return null;
}


// --- Main Action Function ---

export async function getAiResponse(userInput: string, history: Message[]): Promise<string> {
  // ইনপুট নরমালাইজ করা হচ্ছে
  const cleanedInput = normalizeText(userInput);

  // ধাপ ১: ম্যাথ বা অংক চেক
  try {
    const mathResult = calculateExpression(cleanedInput);
    if (mathResult !== null) {
      return `ফলাফল: ${mathResult}`;
    }
  } catch (error) {
    // ম্যাথ না হলে পরের ধাপে যাবে
  }

  // ধাপ ২: ডিকশনারি চেক
  const dictionaryResponse = searchDictionary(userInput); // মূল ইনপুট পাঠানো হচ্ছে কিছু প্যাটার্নের জন্য
  if (dictionaryResponse) {
    return dictionaryResponse;
  }

  // ধাপ ৩: পরিস্থিতি বা কনটেক্সট চেক
  const situationalResponse = getSituationalResponse(cleanedInput, history);
  if (situationalResponse) {
    return situationalResponse;
  }

  // ধাপ ৪: সব জেসন ফাইল চেক (General Intent Matching)
  const matchedIntent = findIntent(cleanedInput);
  
  if (matchedIntent) {
    const responses = matchedIntent.responses;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // ধাপ ৫: কোথাও কিছু না পেলে (Fallback)
  return "দুঃখিত, আমি আপনার কথা ঠিক বুঝতে পারিনি। 😕 দয়া করে একটু সহজভাবে বা অন্যভাবে জিজ্ঞেস করবেন?";
}