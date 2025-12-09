
/**
 * Tries to calculate a math expression from a string.
 * Returns the result or null if it's not a valid math expression.
 * This is a safe alternative to using eval().
 * @param expression The string to evaluate.
 * @returns The result of the calculation or null.
 */
export function calculateExpression(expression: string): number | null {
  // Regular expression to check for valid characters in a math expression.
  // Allows numbers, +, -, *, /, (, ), and spaces.
  const mathRegex = /^[0-9\s\+\-\*\/\(\)\.]+$/;
  if (!mathRegex.test(expression)) {
    return null;
  }

  // Another check to see if there is at least one operator
  const operatorRegex = /[\+\-\*\/]/;
  if (!operatorRegex.test(expression)) {
    return null;
  }

  try {
    // Using the Function constructor is safer than eval() because it doesn't
    // have access to the surrounding scope.
    const result = new Function(`return ${expression}`)();

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
