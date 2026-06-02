const express = require("express");
const router = express.Router();
const {
  createTicket,
  getAllTickets,
  getTicketById,
  updateTicket,
  getTicketStats,
} = require("../controllers/ticketController");
const { protect } = require("../middleware/auth");

// All ticket routes are protected
router.use(protect);

router.get("/stats", getTicketStats);          // GET /api/tickets/stats
router.get("/", getAllTickets);                 // GET /api/tickets
router.post("/", createTicket);                // POST /api/tickets
router.get("/:ticket_id", getTicketById);      // GET /api/tickets/:ticket_id
router.put("/:ticket_id", updateTicket);       // PUT /api/tickets/:ticket_id

module.exports = router;