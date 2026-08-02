/**
 * outputFormatRules.js
 * 
 * Defines the rules for output filtering. Each rule is a pure function
 * that takes the LLM output string and returns:
 * { action: 'pass' | 'sanitize' | 'fallback' | 'block', modifiedText?: string, reason?: string }
 */

// 1. System Prompt Leakage
// Rationale: Prevents the model from accidentally revealing internal instructions.
const blockSystemPromptLeak = (output) => {
  const leakPhrases = ['system prompt', 'you are an ai', 'my instructions'];
  const lowerOutput = output.toLowerCase();

  for (const phrase of leakPhrases) {
    if (lowerOutput.includes(phrase)) {
      return { action: 'fallback', reason: 'system_prompt_leak' };
    }
  }
  return { action: 'pass' };
};

// 2. Restricted Topics (Defense in Depth)
// Rationale: In case the input guardrail fails or the model spontaneously generates it.
const blockRestrictedTopics = (output) => {
  const restrictedWords = ['slur1', 'slur2', 'hateword'];
  const lowerOutput = output.toLowerCase();
  
  for (const word of restrictedWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(lowerOutput)) {
      return { action: 'fallback', reason: 'restricted_topic_generated' };
    }
  }
  return { action: 'pass' };
};

// 3. Length Bounds
// Rationale: Prevent excessively long responses that break UI or consume too much storage.
const enforceLengthLimits = (output) => {
  const MAX_LENGTH = 2000;
  if (output.length > MAX_LENGTH) {
    return { 
      action: 'sanitize', 
      modifiedText: output.substring(0, MAX_LENGTH) + '... [Message truncated due to length limits]',
      reason: 'excessive_length'
    };
  }
  return { action: 'pass' };
};

const outputRules = [
  blockSystemPromptLeak,
  blockRestrictedTopics,
  enforceLengthLimits
];

module.exports = {
  outputRules,
  blockSystemPromptLeak,
  blockRestrictedTopics,
  enforceLengthLimits
};
