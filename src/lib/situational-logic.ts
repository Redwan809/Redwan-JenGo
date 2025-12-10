
import type { Message } from "@/components/chat/ChatLayout";

/**
 * Analyzes the conversation context and provides a situational response if applicable.
 * @param userInput The user's current cleaned input.
 * @param history The entire chat history.
 * @returns A response string if a situation is met, otherwise null.
 */
export function getSituationalResponse(userInput: string, history: Message[]): string | null {
    const lastMessage = history.length > 1 ? history[history.length - 2] : null;
    const lastAiMessage = history.find(m => m.sender === 'ai');

    // Situation: User asks for their own name.
    if (userInput.includes("amar nam ki") || userInput.includes("amar name ki")) {
        let userName: string | null = null;
        // Search history for user's name declaration
        for (const msg of history) {
            if (msg.sender === 'user') {
                const match = msg.text.match(/(?:amar name|amar nam is)\s+(\w+)/i);
                if (match && match[1]) {
                    userName = match[1];
                    break;
                }
            }
        }
        if (userName) {
            return `আপনার নাম তো ${userName}, আমি যতদূর মনে করতে পারছি! 😊`;
        } else {
            return "আমি দুঃখিত, আমি আপনার নাম এখনো জানি না। আপনার নাম কি?";
        }
    }


    // Situation 1: User says "bye" at the very start of the conversation.
    if (history.length <= 2 && (userInput.includes("bye") || userInput.includes("বিদায়"))) {
        return "আমরা তো এখনো কথাই শুরু করিনি! এখনই বিদায়? 😯";
    }

    // Situation 2: User asks a vague question like "how" or "why"
    if (["how", "why", "কেমনে", "কেন", "kivabe"].includes(userInput)) {
        if (lastMessage?.text) {
            return `আপনি "${lastMessage.text}"-এর জবাবে এটি জিজ্ঞেস করছেন? আরেকটু বুঝিয়ে বললে আমার উত্তর দিতে সুবিধা হতো। 😊`;
        }
        return "আপনি কি জানতে চাইছেন, তা আরেকটু বিস্তারিত বলতে পারবেন?";
    }
    
    // Situation 3: User says "good" or "fine" after AI asks how they are
    if (lastAiMessage && lastAiMessage.text.includes("কেমন আছেন")) {
        if (["ভালো", "ভাল", "fine", "good", "bhalo", "valo", "চলে যাচ্ছে"].some(s => userInput.includes(s))) {
            // But check for negative context
            if (!["না", "নি", "নেই", "not"].some(neg => userInput.includes(neg))) {
                 return "শুনে খুব ভালো লাগলো! 😊";
            }
        }
    }
    
    // Situation 4: User just says "hi" or "hello" again mid-conversation
    if (history.length > 3 && ["hi", "hello", "হাই", "হ্যালো"].includes(userInput)) {
        return "আমরা তো কথা বলছিই! বলুন, আর কী জানতে চান? 😄";
    }

    // Situation 5: User seems angry or frustrated
    if (["ধুর", "বাদ দেন", "আপনি পারেন না", "dhur", "bad den"].some(s => userInput.includes(s))) {
        return "মনে হচ্ছে আপনি হতাশ। আমি কি আপনাকে সাহায্য করতে কোনো ভুল করেছি? 😕 দয়া করে আমাকে জানান।";
    }

    // Situation 6: User is being very thankful
    if (lastMessage && lastMessage.sender === 'ai' && ["thank you so much", "অনেক অনেক ধন্যবাদ"].some(s => userInput.includes(s))) {
        return "আপনাকে সাহায্য করতে পেরে আমি আনন্দিত! আপনার আর কোনো প্রশ্ন আছে? 😊";
    }

    // Situation 7: User asks "and?" or "then?"
    if (["and", "then", "আর", "তারপর", "এরপর"].includes(userInput)) {
        return "আপনি কি আমার আগের উত্তরের ধারাবাহিকতায় কিছু জানতে চাইছেন?";
    }

    // Situation 8: User asks for identity again
    if (history.length > 5 && ["তুমি কে", "আপনার নাম কি", "tumi ke"].some(s => userInput.includes(s))) {
        return "আমার পরিচয় তো আগেই দিয়েছি। আমি আপনার বন্ধুসুলভ ভার্চুয়াল অ্যাসিস্ট্যান্ট! 🤖";
    }

    // Situation 9: User repeats the exact same question
    if (lastMessage && lastMessage.sender === 'user' && lastMessage.text.toLowerCase() === userInput) {
        return "আপনি একই প্রশ্ন আবার করেছেন। আমার আগের উত্তরে কি কোনো সমস্যা ছিল?";
    }
    
    // Situation 10: User gives a very short, non-committal answer like "ok" or "hmm"
    if (["ok", "hmm", "আচ্ছা", "হুম"].includes(userInput)) {
        if (lastAiMessage) {
             return "আপনি কি আমার কথা বুঝতে পেরেছেন? আপনার আর কিছু জানার থাকলে বলুন।";
        }
        return "হুম।";
    }

    // Situation 11: User asks if the bot is real
    if (["are you real", "tumi ki real", "তুমি কি সত্যি"].some(s => userInput.includes(s))) {
        return "আমি একটি কম্পিউটার প্রোগ্রাম, তবে আপনার সাথে সত্যিকারের মতোই কথা বলতে চেষ্টা করছি! 💻";
    }

    // Situation 12: User is bored
    if (["i am bored", "আমি বোর হচ্ছি", "boring"].some(s => userInput.includes(s))) {
        return "বোর হবেন না! চলুন একটা মজার জোকস শুনি? অথবা কোনো বিষয় নিয়ে আলোচনাও করতে পারি। আপনি কী করতে চান?";
    }
    
    // Add more situations here...

    return null; // No specific situation met, proceed to general intents
}
