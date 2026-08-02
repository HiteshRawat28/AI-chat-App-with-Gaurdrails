const { outputRules } = require('./rules/outputFormatRules');

/**
 * checkOutput orchestrates the execution of all output guardrail rules.
 * @param {string} text - The LLM's raw output message.
 * @returns {object} { allowed: boolean, sanitizedText: string | null, reason: string | null }
 */
const checkOutput = (text) => {
  if (!text || typeof text !== 'string') {
    return { allowed: false, sanitizedText: null, reason: 'invalid_output' };
  }

  let currentText = text;

  for (const rule of outputRules) {
    const result = rule(currentText);
    
    if (result.action === 'fallback') {
      // Short-circuit on a severe violation that requires a fallback
      return { allowed: false, sanitizedText: null, reason: result.reason };
    }
    
    if (result.action === 'sanitize') {
      // Update the working text and continue to next rules (e.g. truncate length)
      currentText = result.modifiedText;
      return { allowed: true, sanitizedText: currentText, reason: result.reason };
    }
    
    if (result.action === 'block') {
      return { allowed: false, sanitizedText: null, reason: result.reason };
    }
  }

  // If we get here, it either passed fully or was just sanitized
  if (currentText !== text) {
    return { allowed: true, sanitizedText: currentText, reason: 'sanitized' };
  }

  return { allowed: true, sanitizedText: null, reason: null };
};

module.exports = {
  checkOutput
};
