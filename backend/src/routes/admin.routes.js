const express = require('express');
const prisma = require('../prisma');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Middleware to restrict access to a specific test admin email
const adminOnly = (req, res, next) => {
  // For v1, hardcode the test admin email
  const ADMIN_EMAIL = 'admin@example.com';
  
  if (!req.user || req.user.email !== ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Forbidden: Admin access only' });
  }
  
  next();
};

// Apply auth and admin middleware to all admin routes
router.use(authMiddleware);
router.use(adminOnly);

// GET /api/admin/guardrail-events
// Fetch the most recent guardrail events for observability
router.get('/guardrail-events', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '50', 10);
    
    const events = await prisma.guardrailEvent.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { email: true }
        }
      }
    });

    res.json(events);
  } catch (error) {
    console.error('Failed to fetch guardrail events:', error);
    res.status(500).json({ error: 'Failed to fetch guardrail events' });
  }
});

module.exports = router;
