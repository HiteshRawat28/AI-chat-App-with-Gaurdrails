/**
 * guardrailLog.service.js
 * 
 * Service responsible for persisting guardrail events (input block, output flag, rate-limit).
 * 
 * Note: In Phase 4, this is a stub that logs to the console.
 * In Phase 7, it will be updated to write to the PostgreSQL database.
 */

const logGuardrailEvent = async ({ userId, type, ruleTriggered, contentSnippet }) => {
  // Stub implementation
  console.warn(`[GUARDRAIL EVENT] Type: ${type} | User: ${userId} | Rule: ${ruleTriggered} | Snippet: "${contentSnippet}"`);
  
  // Future: await prisma.guardrailEvent.create(...)
};

module.exports = {
  logGuardrailEvent
};
