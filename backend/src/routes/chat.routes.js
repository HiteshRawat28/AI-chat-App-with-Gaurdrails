const express = require('express');
const prisma = require('../prisma');
const authMiddleware = require('../middleware/auth.middleware');
const { generateChatResponse } = require('../llm/geminiClient');

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

// POST /api/chat/message - send a new message
router.post('/message', async (req, res) => {
  try {
    const { content, conversationId } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
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

    // Save assistant message
    const assistantMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: llmResponseText
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
