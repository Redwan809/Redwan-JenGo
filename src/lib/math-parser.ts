
/**
 * Tries to calculate a math expression from a string.
 * Returns the result or null if it's not a valid math expression.
 * This is a safe alternative to using eval().
 * @param expression The string to evaluate.
 * @returns The result of the calculation or null.
 */
export function calculateExpression(expression: string): number | null {
    // Create a mutable copy of the expression
    let sanitizedExpression = expression;

    // First, let's see if there is a valid math expression at the start of the string
    // This handles cases like "1+1=2 why"
    const coreMathMatch = sanitizedExpression.match(/^([0-9\s\+\-\*\/\(\)\.÷×]+)/);
    if (coreMathMatch) {
        sanitizedExpression = coreMathMatch[1].trim();
    }


    // Replace special division and multiplication symbols
    sanitizedExpression = sanitizedExpression.replace(/÷/g, '/').replace(/×/g, '*');

    // Replace other bracket types with parentheses
    sanitizedExpression = sanitizedExpression.replace(/[{[<]/g, '(').replace(/[}\]>]/g, ')');
    
    // Add multiplication operator before an opening parenthesis if it's missing
    // e.g., "5(2)" becomes "5*(2)"
    sanitizedExpression = sanitizedExpression.replace(/(\d)\(/g, '$1*(');


  // Regular expression to check for valid characters in a math expression.
  // Allows numbers, +, -, *, /, (, ), and spaces.
  const mathRegex = /^[0-9\s\+\-\*\/\(\)\.]+$/;
  if (!mathRegex.test(sanitizedExpression)) {
    return null;
  }

  // Another check to see if there is at least one operator
  const operatorRegex = /[\+\-\*\/]/;
  if (!operatorRegex.test(sanitizedExpression)) {
    return null;
  }

  try {
    // Using the Function constructor is safer than eval() because it doesn't
    // have access to the surrounding scope.
    const result = new Function(`return ${sanitizedExpression}`)();

    // Check if the result is a valid number
    if (typeof result === 'number' && isFinite(result)) {
      return result;
    }
    return null;
  } catch (error) {
    // If parsing or execution fails, it's not a valid expression.
    return null;
  }
}
