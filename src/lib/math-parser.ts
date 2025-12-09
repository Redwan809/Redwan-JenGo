
/**
 * Safely calculates a math expression from a string.
 * It's a safer alternative to eval() as it's more restrictive.
 * @param expression The string to evaluate.
 * @returns The result of the calculation or null if it's not a valid/safe expression.
 */
export function calculateExpression(expression: string): number | null {
    // 1. Sanitize and Normalize the expression
    let sanitizedExpression = expression
        .trim()
        .replace(/÷/g, '/')       // Replace special division symbol
        .replace(/×/g, '*')       // Replace special multiplication symbol
        .replace(/[{[<]/g, '(')   // Normalize brackets to parentheses
        .replace(/[}\]>]/g, ')')
        .replace(/(\d)\(/g, '$1*('); // Add multiplication for cases like 5(2)

    // 2. Strict Validation: Only allow a very specific set of characters.
    // This is the main security layer.
    // Allows: numbers (0-9), decimals (.), operators (+, -, *, /), parentheses, and spaces.
    // It explicitly disallows any letters, equals signs, or other symbols.
    const mathRegex = /^[0-9\s\+\-\*\/\(\)\.]+$/;
    if (!mathRegex.test(sanitizedExpression)) {
        return null;
    }
    
    // 3. Prevent trivial or unsafe inputs
    // Check for empty strings or strings with only operators/spaces.
    if (!/\d/.test(sanitizedExpression)) {
        return null;
    }
    // Check if there's at least one operator.
    if (!/[\+\-\*\/]/.test(sanitizedExpression)) {
        return null;
    }
    // Prevent expressions that are just operators e.g., "++" or "*/"
    if (/^[\s\+\-\*\/]+$/.test(sanitizedExpression)) {
        return null;
    }

    try {
        // 4. Use the Function constructor, which is safer than eval().
        // It runs in its own scope and does not have access to the outer scope's variables.
        // Combined with our strict regex, the risk of code injection is minimized.
        const result = new Function(`return ${sanitizedExpression}`)();

        // 5. Final check on the output
        if (typeof result === 'number' && isFinite(result)) {
            return result;
        }
        return null;
    } catch (error) {
        // If parsing or execution fails (e.g., "1+/2"), it's not a valid expression.
        return null;
    }
}
