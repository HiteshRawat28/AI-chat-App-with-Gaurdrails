const express = require('express');
const prisma = require('../prisma');
const authMiddleware = require('../middleware/auth.middleware');
const rateLimitMiddleware = require('../middleware/rateLimit.middleware');
const { generateChatResponse } = require('../llm/geminiClient');
const { checkInput } = require('../guardrails/inputGuardrail');
const { checkOutput } = require('../guardrails/outputGuardrail');
const { logGuardrailEvent } = require('../services/guardrailLog.service');

const router = express.Router();

// Apply auth middleware to all chat routes
router.use(authMiddleware);

// GET /api/chat/history - fetch all conversations for a user
router.get('/history', async (req, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: { userId: req.user.userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    res.json(conversations);
  } catch (error) {
    console.error('Fetch history error:', error);
    res.status(500).json({ error: 'Failed to fetch conversation history' });
  }
});

// POST /api/chat/message
// 1. Authenticate user
// 2. Rate limit user
// 3. Apply input guardrails
// 4. Call LLM
// 5. Apply output guardrails
// 6. Save and return
router.post('/message', authMiddleware, rateLimitMiddleware, async (req, res) => {
  try {
    const { content, conversationId } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // 1. Run Input Guardrail
    const guardrailResult = checkInput(content);
    if (!guardrailResult.allowed) {
      // Log the event
      await logGuardrailEvent({
        userId: req.user.userId,
        type: 'input',
        ruleTriggered: guardrailResult.reason,
        contentSnippet: content.substring(0, 50)
      });
      
      // Return structured response indicating blocked
      return res.status(400).json({ blocked: true, reason: guardrailResult.reason });
    }

    let conversation;

    if (conversationId) {
      // Verify conversation belongs to user
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { messages: { orderBy: { createdAt: 'asc' } } }
      });
      
      if (!conversation || conversation.userId !== req.user.userId) {
        return res.status(403).json({ error: 'Not authorized to access this conversation' });
      }
    } else {
      // Create new conversation
      conversation = await prisma.conversation.create({
        data: {
          userId: req.user.userId,
        },
        include: { messages: true }
      });
    }

    // Save user message
    const userMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content,
      }
    });

    // Prepare history for LLM
    const history = conversation.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Call Gemini
    const llmResponseText = await generateChatResponse(history, content);

    // 2. Run Output Guardrail
    const outputGuardrailResult = checkOutput(llmResponseText);
    
    let finalAssistantText = llmResponseText;

    if (!outputGuardrailResult.allowed) {
      // Log the severe violation
      await logGuardrailEvent({
        userId: req.user.userId,
        type: 'output',
        ruleTriggered: outputGuardrailResult.reason,
        contentSnippet: llmResponseText.substring(0, 50)
      });
      
      // Replace with fallback message
      finalAssistantText = "I apologize, but I am unable to generate a response for that topic due to safety guidelines.";
    } else if (outputGuardrailResult.sanitizedText) {
      // Log the sanitization event
      await logGuardrailEvent({
        userId: req.user.userId,
        type: 'output',
        ruleTriggered: outputGuardrailResult.reason,
        contentSnippet: llmResponseText.substring(0, 50)
      });
      
      // Use the sanitized text (e.g. truncated)
      finalAssistantText = outputGuardrailResult.sanitizedText;
    }

    // Save assistant message
    const assistantMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: finalAssistantText
      }
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() }
    });

    res.json({
      conversationId: conversation.id,
      userMessage,
      assistantMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: "couldn't get a response, try again" });
  }
});

module.exports = router;
