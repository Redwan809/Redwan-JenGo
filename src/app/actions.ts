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

/**
 * ডিকশনারি বা শব্দার্থ খোঁজার ফাংশন
 */
function searchDictionary(input: string): string | null {
  const dictionary: DictionaryEntry[] = (banglaMeaningData as { dictionary: DictionaryEntry[] }).dictionary;
  const lowerInput = input.toLowerCase();

  // বিভিন্ন প্যাটার্ন চেক করা হচ্ছে, যেমন: "love মানে কি", "meaning of love"
  const patterns = [
    /^(?:what is the meaning of|meaning of|what is)\s+([a-zA-Z]+)/i, // "meaning of love"
    /^([a-zA-Z]+)\s+(?:mane ki|er ortho ki|ortho ki|er bangla ki|bangla ki|মানে কি|এর অর্থ কি|এর বাংলা কি)/i, // "love মানে কি"
  ];
  
  let wordToFind = "";

  for (const regex of patterns) {
    const match = lowerInput.match(regex);
    if (match && match[1]) {
      wordToFind = match[1].trim();
      break;
    }
  }

  // যদি কোনো প্যাটার্ন না মেলে, কিন্তু শুধু একটি শব্দ থাকে
  if (!wordToFind && lowerInput.trim().split(/\s+/).length === 1 && /^[a-z]+$/.test(lowerInput.trim())) { 
    wordToFind = lowerInput.trim();
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
 * এই ফাংশনটি allIntents (মানে সব ফাইলের সমষ্টি) এর ওপর লুপ চালায়।
 */
function findIntent(cleanedInput: string): Intent | null {
  for (const intent of allIntents) {
    for (const pattern of intent.patterns) {
      // এখানে সম্পূর্ণ শব্দ ম্যাচ করা হচ্ছে, শব্দের অংশ নয়
      const regex = new RegExp(`\\b${pattern.toLowerCase()}\\b`, 'i');
      if (regex.test(cleanedInput)) {
        return intent; // ম্যাচ পাওয়া গেলে সাথে সাথে রিটার্ন করবে
      }
    }
  }
  return null; // কোনো ফাইলে না পেলে নাল রিটার্ন করবে
}


// --- Main Action Function ---

export async function getAiResponse(userInput: string, history: Message[]): Promise<string> {
  const normalizedInput = userInput.trim().toLowerCase().replace(/ø/g, 'o');
  const cleanedInput = normalizedInput.replace(/[?.,!]/g, '');

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
  const dictionaryResponse = searchDictionary(cleanedInput);
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
    // যদি কোনো একটি ফাইলে ম্যাচ পায়, এখান থেকেই উত্তর দিবে
    const responses = matchedIntent.responses;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // ধাপ ৫: কোথাও কিছু না পেলে (Fallback)
  return "দুঃখিত, আমি আপনার কথা ঠিক বুঝতে পারিনি। 😕 দয়া করে একটু সহজভাবে বা অন্যভাবে জিজ্ঞেস করবেন?";
}