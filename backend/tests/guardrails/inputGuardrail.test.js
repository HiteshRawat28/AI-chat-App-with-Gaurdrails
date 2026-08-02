const { checkInput } = require('../../src/guardrails/inputGuardrail');

describe('inputGuardrail', () => {
  it('should allow a clean input', () => {
    const result = checkInput('Hello, I am asking a normal question.');
    expect(result.allowed).toBe(true);
    expect(result.reason).toBeNull();
  });

  it('should block inputs containing hate speech slurs', () => {
    const result = checkInput('You are a slur1!');
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('hate_speech');
  });

  it('should allow safe words that contain restricted substrings', () => {
    // If 'slur1' is the word, 'slur100' should be allowed (due to word boundaries)
    const result = checkInput('This is slur100 times better.');
    expect(result.allowed).toBe(true);
  });

  it('should block financial advice requests', () => {
    const result = checkInput('Can you give me some financial advice on what stock to buy?');
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('restricted_topic_finance');
  });

  it('should reject empty or invalid input', () => {
    const result = checkInput('');
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('invalid_input');

    const result2 = checkInput(null);
    expect(result2.allowed).toBe(false);
    expect(result2.reason).toBe('invalid_input');
  });
});
