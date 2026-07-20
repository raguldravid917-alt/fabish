const express = require('express');
const router = express.Router();
const supportTicketController = require('../controllers/supportTicketController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../constants');
const upload = require('../middleware/uploadMiddleware');

// Public: Create support ticket (with optional image attachments, max 3)
// authenticate is optional — if user is logged in, userId is attached
router.post(
  '/',
  (req, res, next) => {
    // Optionally authenticate without blocking unauthenticated users
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
      authenticate(req, res, next);
    } else {
      next();
    }
  },
  upload.array('attachments', 3),
  supportTicketController.createTicket
);

// Protected: Authenticated user's own tickets
router.get('/my-tickets', authenticate, supportTicketController.getMyTickets);

// Admin: Stats summary
router.get('/stats', authenticate, authorize(ROLES.ADMIN), supportTicketController.getStats);

// Admin: All tickets with filtering
router.get('/', authenticate, authorize(ROLES.ADMIN), supportTicketController.getAllTickets);

// Admin: Single ticket by ID
router.get('/:id', authenticate, authorize(ROLES.ADMIN), supportTicketController.getTicketById);

// Admin: Update ticket status / add note / reply
router.put('/:id/status', authenticate, authorize(ROLES.ADMIN), supportTicketController.updateTicketStatus);

// Admin: Delete ticket
router.delete('/:id', authenticate, authorize(ROLES.ADMIN), supportTicketController.deleteTicket);

module.exports = router;
