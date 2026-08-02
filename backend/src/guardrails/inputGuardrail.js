const { rules } = require('./rules/restrictedTopics');

/**
 * checkInput orchestrates the execution of all input guardrail rules.
 * @param {string} text - The user's input message.
 * @returns {object} { allowed: boolean, reason: string | null }
 */
const checkInput = (text) => {
  if (!text || typeof text !== 'string') {
    return { allowed: false, reason: 'invalid_input' };
  }

  for (const rule of rules) {
    const result = rule(text);
    if (!result.allowed) {
      // Short-circuit on the first failed rule
      return result;
    }
  }

  return { allowed: true, reason: null };
};

module.exports = {
  checkInput
};
