/**
 * Safely calculates a math expression from a string.
 */
export function calculateExpression(expression: string): number | null {
    // ১. ক্লিনআপ: অপ্রয়োজনীয় চিহ্ন (=, ?, >) মুছে ফেলা এবং ব্র্যাকেট ঠিক করা
    let sanitizedExpression = expression
        .trim()
        .replace(/÷/g, '/')
        .replace(/×/g, '*')
        .replace(/[=?]/g, '')  // সমান এবং প্রশ্নবোধক চিহ্ন মুছে ফেলা
        .replace(/[{[<]/g, '(')
        .replace(/[}\]>]/g, ')')
        .replace(/\s+/g, ''); // স্পেস রিমুভ

    // ২. ভ্যালিডেশন: শুধুমাত্র সংখ্যা এবং অপারেটর অ্যালাউড
    // (English digits 0-9 and operators)
    const validCharsRegex = /^[0-9\+\-\*\/\(\)\.]+$/;
    
    if (!validCharsRegex.test(sanitizedExpression)) {
        return null;
    }

    // ৩. সেফটি চেক: পরপর একাধিক অপারেটর বা ভুল ফরম্যাট আটকানো
    if (/[\+\-\*\/]{2,}/.test(sanitizedExpression)) {
        return null;
    }
    
    // ৪. অঙ্কটি করার চেষ্টা করা
    try {
        const result = new Function(`return ${sanitizedExpression}`)();

        if (typeof result === 'number' && isFinite(result)) {
            return result;
        }
        return null;
    } catch (error) {
        return null;
    }
}
