"use server";

// ১. সব JSON ফাইল ইম্পোর্ট
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

// --- ২. ডাটাবেস তৈরি (সব ফাইল এক করা) ---
// কোনো ফাইল মিসিং বা এরর থাকলে সেটা স্কিপ করবে, কিন্তু বাকিগুলো লোড করবে।
const loadAllIntents = (): Intent[] => {
  const allData = [
    generalIntents,
    socialIntents,
    identityIntents, // আপনার কাঙ্ক্ষিত identity ফাইল
    emojiIntents,
    knowledgeIntents,
    historyIntents,
    scienceIntents,
    creativeIntents,
    abuseIntents
  ];

  let combinedIntents: Intent[] = [];
  
  allData.forEach((data) => {
    if ((data as IntentData).intents) {
      combinedIntents = [...combinedIntents, ...(data as IntentData).intents];
    }
  });

  return combinedIntents;
};

const DATABASE = loadAllIntents(); // এটিই আমাদের মেইন ডাটাবেস

// --- ৩. পাওয়ারফুল টেক্সট ক্লিনার ---
// এটি ইনপুটকে এমনভাবে প্রস্তুত করে যাতে ফাইলের সাথে হুবহু মিল পাওয়া যায়।
function cleanText(text: string): string {
  if (!text) return "";
  return text
    .normalize("NFKC") // বাংলা বা ইংলিশ সব ক্যারেক্টার স্ট্যান্ডার্ড করে
    .toLowerCase()     // ছোট হাতের অক্ষরে রূপান্তর
    .replace(/[?.!,;:"'()\[\]{}।\-]/g, "") // সব বিরাম চিহ্ন রিমুভ
    .replace(/\s+/g, " ") // অতিরিক্ত স্পেস রিমুভ
    .trim();
}

/**
 * ৪. ইউনিভার্সাল স্ক্যানার (Universal File Scanner)
 * এই ফাংশনটি ডাটাবেসের শুরু থেকে শেষ পর্যন্ত প্রতিটি প্যাটার্ন চেক করবে।
 */
function scanAllFiles(userInput: string): Intent | null {
  const cleanedInput = cleanText(userInput);
  
  // লুপ চালিয়ে প্রতিটি ফাইলের প্রতিটি ইনটেন্ট চেক করা হচ্ছে
  for (const intent of DATABASE) {
    for (const pattern of intent.patterns) {
      const cleanedPattern = cleanText(pattern);

      // লজিক ১: হুবহু মিল (Exact Match)
      // যেমন: Pattern: "তোমার নাম কি", Input: "তোমার নাম কি"
      if (cleanedInput === cleanedPattern) {
        return intent;
      }

      // লজিক ২: ইনপুটের মধ্যে প্যাটার্ন আছে কিনা (Partial Match - Input contains Pattern)
      // যেমন: Input: "ভাই তোমার নাম কি বলো", Pattern: "তোমার নাম কি"
      // এখানে ইনপুট বড়, কিন্তু প্যাটার্নটি তার ভেতরে আছে।
      if (cleanedInput.includes(cleanedPattern)) {
        // ছোট শব্দের ভুল ম্যাচ এড়ানোর জন্য চেক (যেমন 'hi' যেন 'history' তে ম্যাচ না করে)
        // প্যাটার্নটি অবশ্যই আলাদা শব্দ হিসেবে থাকতে হবে অথবা ৩ অক্ষরের বেশি হতে হবে
        if (cleanedPattern.length > 3 || cleanedInput.split(" ").includes(cleanedPattern)) {
             return intent;
        }
      }

      // লজিক ৩: প্যাটার্নের মধ্যে ইনপুট আছে কিনা (Reverse Match)
      // যেমন: Input: "নাম কি", Pattern: "তোমার নাম কি"
      // ইউজার ছোট করে লিখলে যেন বড় প্যাটার্নটি ধরে ফেলে।
      if (cleanedPattern.includes(cleanedInput)) {
         // খুব ছোট ইনপুট (যেমন ১-২ অক্ষর) এড়াতে হবে যাতে ভুল রেজাল্ট না আসে
         if (cleanedInput.length > 2) {
            return intent;
         }
      }
    }
  }

  return null; // পুরো ডাটাবেস খুঁজেও কিছু না পেলে null
}

// --- ডিকশনারি ফাংশন ---
function checkDictionary(input: string): string | null {
  try {
    const dictionary = (banglaMeaningData as { dictionary: DictionaryEntry[] }).dictionary;
    const cleanInput = cleanText(input);
    
    // ১. সরাসরি শব্দ খোঁজা
    const directMatch = dictionary.find(d => d.en.toLowerCase() === cleanInput);
    if (directMatch) return `"${directMatch.en}"-এর বাংলা অর্থ হলো "${directMatch.bn}"।`;

    // ২. "meaning of X" বা "X মানে কি" প্যাটার্ন
     const patterns = [
      /^(?:what is the meaning of|meaning of|what is)\s+([a-zA-Z]+)/i, 
      /^([a-zA-Z]+)\s+(?:mane ki|er ortho ki|ortho ki|er bangla ki|bangla ki|মানে কি|এর অর্থ কি|এর বাংলা কি)/i,
    ];
    
    let wordToFind = "";

    for (const regex of patterns) {
        const match = input.trim().toLowerCase().match(regex);
        if (match && match[1]) {
            wordToFind = match[1].trim();
            break;
        }
    }
    
    if (wordToFind) {
      const match = dictionary.find(d => d.en.toLowerCase() === wordToFind);
      if (match) return `"${match.en}"-এর বাংলা অর্থ হলো "${match.bn}"।`;
    }

    return null;
  } catch (e) { return null; }
}


// --- Main Server Action ---

export async function getAiResponse(userInput: string, history: Message[]): Promise<string> {
  const rawInput = userInput.trim();
  if (!rawInput) return "কিছু বলুন, আমি শুনছি! 😊";

  // ১. ম্যাথ (Math) আগে চেক করা ভালো কারণ এটি সুনির্দিষ্ট লজিক
  try {
    const mathResult = calculateExpression(rawInput);
    if (mathResult !== null) return `হিসাব অনুযায়ী ফলাফল: ${mathResult}`;
  } catch (e) {}

  // ২. ডিকশনারি (Dictionary)
  const dictResponse = checkDictionary(rawInput);
  if (dictResponse) return dictResponse;

  // ৩. সিচুয়েশনাল লজিক (Context) - যদি আগের কথার রেশ ধরে কিছু বলে
  const situationalResponse = getSituationalResponse(cleanText(rawInput), history);
  if (situationalResponse) return situationalResponse;

  // ৪. সব ফাইল স্ক্যান (The Universal Scan)
  // এখানে আপনার "তোমার পরিচয় কি" এবং অন্যান্য সব কিছু চেক হবে।
  const matchedIntent = scanAllFiles(rawInput);
  
  if (matchedIntent) {
    const responses = matchedIntent.responses;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // ৫. কিছুই না পেলে
  return "দুঃখিত, আমার ডাটাবেসে এই প্রশ্নের উত্তরটি এই মুহূর্তে খুঁজে পাচ্ছি না। আপনি কি অন্য কোনো বিষয়ে জানতে চান?";
}