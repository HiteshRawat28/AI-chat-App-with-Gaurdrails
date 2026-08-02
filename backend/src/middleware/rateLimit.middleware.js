const { PrismaClient } = require('@prisma/client');
const { logGuardrailEvent } = require('../services/guardrailLog.service');
const prisma = new PrismaClient();

const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '5', 10);
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);

const rateLimitMiddleware = async (req, res, next) => {
  if (!req.user || !req.user.userId) {
    // If not authenticated, we can't rate limit by user (should be caught by auth middleware first)
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = req.user.userId;
  const now = new Date();

  try {
    // Upsert the user's rate limit record
    const rateLimit = await prisma.rateLimit.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        count: 0,
        resetTime: new Date(now.getTime() + WINDOW_MS)
      }
    });

    let newCount = rateLimit.count;
    let newResetTime = rateLimit.resetTime;

    // If the window has expired, reset the count and window
    if (now > rateLimit.resetTime) {
      newCount = 1;
      newResetTime = new Date(now.getTime() + WINDOW_MS);
    } else {
      // Still within the window, increment
      newCount += 1;
    }

    // Save the new state
    await prisma.rateLimit.update({
      where: { userId },
      data: {
        count: newCount,
        resetTime: newResetTime
      }
    });

    // Check if limit exceeded
    if (newCount > MAX_REQUESTS) {
      const retryAfterMs = newResetTime.getTime() - now.getTime();
      const retryAfterSec = Math.ceil(retryAfterMs / 1000);

      // Log the rate limit violation
      await logGuardrailEvent({
        userId,
        type: 'rate-limit',
        ruleTriggered: 'max_requests_exceeded',
        contentSnippet: `Attempted to send message but exceeded ${MAX_REQUESTS} req / ${WINDOW_MS}ms`
      });

      return res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: retryAfterSec
      });
    }

    // Passed
    next();
  } catch (error) {
    console.error('Rate limit error:', error);
    // Fail open on rate limiting errors so we don't break the app if DB has a hiccup
    next();
  }
};

module.exports = rateLimitMiddleware;
