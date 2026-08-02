const prisma = require('../prisma');

/**
 * Logs a guardrail event to the database.
 * Fails open: if logging fails, it catches the error and does not throw,
 * ensuring the user's request is not blocked by a logging failure.
 *
 * @param {Object} params
 * @param {string} params.userId - The ID of the user who triggered the event
 * @param {string} params.type - 'input' | 'output' | 'rate-limit'
 * @param {string} params.ruleTriggered - e.g., 'restricted_topic_finance'
 * @param {string} [params.contentSnippet] - A snippet of the text that triggered the block
 */
const logGuardrailEvent = async ({ userId, type, ruleTriggered, contentSnippet }) => {
  try {
    // Log to console for local visibility
    console.warn(`[GUARDRAIL EVENT] Type: ${type} | User: ${userId} | Rule: ${ruleTriggered} | Snippet: "${contentSnippet}"`);

    // Insert into database
    await prisma.guardrailEvent.create({
      data: {
        userId,
        type,
        ruleTriggered,
        contentSnippet: contentSnippet ? contentSnippet.substring(0, 255) : null
      }
    });
  } catch (error) {
    console.error('[GUARDRAIL DB ERROR] Failed to save guardrail event to DB:', error);
    // Do NOT throw error. We must fail open on logging.
  }
};

module.exports = {
  logGuardrailEvent
};
