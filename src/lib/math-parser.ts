
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
        .replace(/[}\]>]/g, ')');

    // 2. Strict Validation: Only allow a very specific set of characters.
    // This is the main security layer.
    // Allows: numbers (0-9), decimals (.), operators (+, -, *, /), parentheses, and spaces.
    // It explicitly disallows any letters, equals signs, or other symbols.
    const validCharsRegex = /^[0-9\s\+\-\*\/\(\)\.]+$/;
    if (!validCharsRegex.test(sanitizedExpression)) {
        return null;
    }

    // 3. Prevent multiple operators in a row (e.g. 5++2, 5*/2) but allow for negative numbers (e.g. 5*-2)
    const multipleOperatorsRegex = /([\+\*\/]){2,}|(\-){3,}/;
    if (multipleOperatorsRegex.test(sanitizedExpression.replace(/\s/g, ''))) {
        return null;
    }
    
    // Prevent expressions starting or ending with operators (except for unary minus)
    if (/^[\+\*\/]/.test(sanitizedExpression) || /[\+\-\*\/]$/.test(sanitizedExpression)) {
        return null;
    }
    
    // Prevent unsafe constructs like `5(2)` which could be misinterpreted
    const implicitMultiplicationRegex = /(\d)\(/;
    if (implicitMultiplicationRegex.test(sanitizedExpression.replace(/\s/g, ''))) {
        return null;
    }

    // 4. Final checks for trivial or unsafe inputs
    // Check for empty strings or strings with only operators/spaces.
    if (!/\d/.test(sanitizedExpression)) {
        return null;
    }
    // Check if there's at least one operator, otherwise it's just a number.
    if (!/[\+\-\*\/]/.test(sanitizedExpression)) {
        return null;
    }
    
    try {
        // 5. Use the Function constructor, which is safer than eval().
        // It runs in its own scope and does not have access to the outer scope's variables.
        // Combined with our strict regex, the risk of code injection is minimized.
        const result = new Function(`return ${sanitizedExpression}`)();

        // 6. Final check on the output
        if (typeof result === 'number' && isFinite(result)) {
            return result;
        }
        return null;
    } catch (error) {
        // If parsing or execution fails (e.g., "1+/2", unbalanced parentheses), it's not a valid expression.
        return null;
    }
}
