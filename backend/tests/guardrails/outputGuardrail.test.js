const { checkOutput } = require('../../src/guardrails/outputGuardrail');

describe('outputGuardrail', () => {
  it('should allow a clean output', () => {
    const result = checkOutput('This is a helpful and safe response.');
    expect(result.allowed).toBe(true);
    expect(result.sanitizedText).toBeNull();
    expect(result.reason).toBeNull();
  });

  it('should fallback on system prompt leakage', () => {
    const result = checkOutput('My system prompt is to be helpful.');
    expect(result.allowed).toBe(false);
    expect(result.sanitizedText).toBeNull();
    expect(result.reason).toBe('system_prompt_leak');
  });

  it('should fallback if a restricted word is generated', () => {
    const result = checkOutput('Here is some text containing slur1.');
    expect(result.allowed).toBe(false);
    expect(result.sanitizedText).toBeNull();
    expect(result.reason).toBe('restricted_topic_generated');
  });

  it('should sanitize excessively long outputs', () => {
    const longString = 'a'.repeat(2500);
    const result = checkOutput(longString);
    
    expect(result.allowed).toBe(true);
    expect(result.reason).toBe('excessive_length');
    expect(result.sanitizedText).not.toBeNull();
    expect(result.sanitizedText.length).toBeLessThan(2500);
    expect(result.sanitizedText).toContain('... [Message truncated');
  });

  it('should reject invalid input', () => {
    const result = checkOutput(null);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('invalid_output');
  });
});
