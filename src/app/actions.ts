"use server";

import generalIntents from "@/lib/intents/general";
import socialIntents from "@/lib/intents/social";
import identityIntents from "@/lib/intents/identity";
import emojiIntents from "@/lib/intents/emoji";
import knowledgeIntents from "@/lib/intents/knowledge";
import historyIntents from "@/lib/intents/history";
import scienceIntents from "@/lib/intents/science";
import creativeIntents from "@/lib/intents/creative";
import abuseIntents from "@/lib/intents/abuse";
import memesIntents from "@/lib/intents/memes";
import banglaMeaningData from "@/lib/intents/bangla-meaning";

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

// --- ১. ডাটাবেস লোড ---
const loadAllIntents = (): Intent[] => {
  const allData: IntentData[] = [
    generalIntents,
    socialIntents,
    identityIntents,
    emojiIntents,
    knowledgeIntents,
    historyIntents,
    scienceIntents,
    creativeIntents,
    abuseIntents,
    memesIntents,
  ];

  let combinedIntents: Intent[] = [];
  allData.forEach((data) => {
    if (data && data.intents) {
      combinedIntents = [...combinedIntents, ...data.intents];
    }
  });
  return combinedIntents;
};

const DATABASE = loadAllIntents();

// --- ২. অ্যালগরিদম: টেক্সট ক্লিনার ---
function cleanText(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0980-\u09FF\s]/g, "") // শুধু বাংলা, ইংরেজি ও সংখ্যা রাখবে
    .replace(/\s+/g, " "); // এক্সট্রা স্পেস ডিলিট
}

// --- ৩. অ্যালগরিদম: Levenshtein Distance (বানান ভুল ধরার জাদুকরী লজিক) ---
function getSimilarity(s1: string, s2: string): number {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  const longerLength = longer.length;
  
  if (longerLength === 0) return 1.0;
  
  const costs: number[] = [];
  for (let i = 0; i <= longer.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= shorter.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (longer.charAt(i - 1) !== shorter.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[shorter.length] = lastValue;
  }
  
  return (longerLength - costs[shorter.length]) / longerLength;
}

/**
 * ৪. আল্টিমেট স্ক্যানার
 * এটি এক্সাক্ট ম্যাচ না পেলে বানানের মিল চেক করবে।
 */
function scanAllFiles(userInput: string): Intent | null {
  const input = cleanText(userInput);
  
  let bestMatch: Intent | null = null;
  let highestScore = 0.70; // সর্বনিম্ন ৭০% মিল থাকতে হবে

  console.log(`Checking: "${input}"`);

  for (const intent of DATABASE) {
    for (const pattern of intent.patterns) {
      const dbPattern = cleanText(pattern);

      // ১. যদি হুবহু মিলে যায় (Fastest)
      if (input === dbPattern) {
        console.log(`Exact Match Found: "${dbPattern}" in [${intent.tag}]`);
        return intent;
      }
        
      // ২. যদি ইনপুটের মধ্যে প্যাটার্ন থাকে (যেমন: "প্লিজ তোমার নাম কি")
      if (input.includes(dbPattern) && dbPattern.length > 3) {
         console.log(`Substring Match (Pattern in Input) Found: "${dbPattern}" in [${intent.tag}]`);
         return intent;
      }

      // ৩. যদি প্যাটার্নের মধ্যে ইনপুট থাকে (যেমন: "নাম কি" -> "তোমার নাম কি")
      if (dbPattern.includes(input) && input.length > 3) {
         console.log(`Substring Match (Input in Pattern) Found: "${dbPattern}" in [${intent.tag}]`);
         return intent;
      }

      // ৪. ফাজি ম্যাচিং (বানান ভুল চেক)
      const score = getSimilarity(input, dbPattern);
      
      if (score > highestScore) {
        highestScore = score;
        bestMatch = intent;
        console.log(`Potential Fuzzy Match: "${dbPattern}" with score ${score} in [${intent.tag}]`);
      }
    }
  }

  return bestMatch;
}

// --- ডিকশনারি ---
function checkDictionary(input: string): string | null {
  try {
    const dictionary: DictionaryEntry[] = (banglaMeaningData as { dictionary: DictionaryEntry[] }).dictionary;
    const cleanInput = cleanText(input);
    
    const directMatch = dictionary.find(d => d.en.toLowerCase() === cleanInput);
    if (directMatch) return `"${directMatch.en}"-এর বাংলা অর্থ হলো "${directMatch.bn}"।`;

    if (cleanInput.includes("meaning") || cleanInput.includes("mane")) {
      const words = cleanInput.split(" ");
      for (const word of words) {
        const match = dictionary.find(d => d.en.toLowerCase() === word);
        if (match) return `"${match.en}"-এর বাংলা অর্থ হলো "${match.bn}"।`;
      }
    }
    return null;
  } catch (e) {
    return null;
  }
}

// --- Main Action ---
export async function getAiResponse(userInput: string, history: Message[]): Promise<string> {
  const rawInput = userInput.trim();
  if (!rawInput) return "কিছু বলুন, আমি শুনছি! 😊";

  // ১. ম্যাথ
  try {
    const mathResult = calculateExpression(rawInput);
    if (mathResult !== null) return `হিসাব অনুযায়ী ফলাফল: ${mathResult}`;
  } catch (e) {}

  // ২. ডিকশনারি
  const dictResponse = checkDictionary(rawInput);
  if (dictResponse) return dictResponse;

  // ৩. সিচুয়েশনাল লজিক
  const situationalResponse = getSituationalResponse(cleanText(rawInput), history);
  if (situationalResponse) return situationalResponse;

  // ৪. সব ফাইল স্ক্যান (fuzzy + exact)
  const matchedIntent = scanAllFiles(rawInput);
  
  if (matchedIntent) {
    const responses = matchedIntent.responses;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // ৫. ফলব্যাক
  return "আমি দুঃখিত, আমি আপনার কথাটি ঠিক বুঝতে পারিনি। 🤔";
}
