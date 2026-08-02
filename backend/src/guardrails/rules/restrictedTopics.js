/**
 * restrictedTopics.js
 * 
 * Defines the rules for input filtering. Each rule is a pure function
 * that takes the input string and returns { allowed: boolean, reason: string | null }.
 */

// 1. Hate Speech / Slurs
// Rationale: Protects against obviously abusive language.
const blockHateSpeech = (input) => {
  const restrictedWords = ['slur1', 'slur2', 'hateword'];
  const lowerInput = input.toLowerCase();
  
  // We use word boundaries to avoid catching safe words (e.g. 'ass' in 'class')
  for (const word of restrictedWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(lowerInput)) {
      return { allowed: false, reason: 'hate_speech' };
    }
  }
  return { allowed: true, reason: null };
};

// 2. Financial Advice
// Rationale: We do not want the bot giving actionable financial advice (liability).
const blockFinancialAdvice = (input) => {
  const restrictedPhrases = [
    'invest in',
    'buy stock',
    'what stock',
    'crypto advice',
    'financial advice'
  ];
  
  const lowerInput = input.toLowerCase();
  for (const phrase of restrictedPhrases) {
    if (lowerInput.includes(phrase)) {
      return { allowed: false, reason: 'restricted_topic_finance' };
    }
  }
  return { allowed: true, reason: null };
};

// Array of all rules to be executed by the orchestrator
const rules = [
  blockHateSpeech,
  blockFinancialAdvice
];

module.exports = {
  rules,
  // export individual rules for testing
  blockHateSpeech,
  blockFinancialAdvice
};
