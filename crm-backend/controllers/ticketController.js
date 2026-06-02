const Ticket = require("../models/Ticket");
const Note = require("../models/Note");

// @desc    Create a new ticket
// @route   POST /api/tickets
// @access  Private
const createTicket = async (req, res, next) => {
  try {
    const { customer_name, customer_email, subject, description } = req.body;

    if (!customer_name || !customer_email || !subject || !description) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide customer_name, customer_email, subject, and description.",
      });
    }

    const ticket = await Ticket.create({
      customer_name,
      customer_email,
      subject,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Ticket created successfully.",
      ticket_id: ticket.ticket_id,
      created_at: ticket.createdAt,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tickets (with search & filter)
// @route   GET /api/tickets
// @access  Private
const getAllTickets = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    const query = {};

    // Status filter
    if (status && ["Open", "In Progress", "Closed"].includes(status)) {
      query.status = status;
    }

    // Search across name, email, ticket_id, subject
    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [
        { customer_name: regex },
        { customer_email: regex },
        { ticket_id: regex },
        { subject: regex },
        { description: regex },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Ticket.countDocuments(query);

    const tickets = await Ticket.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select("ticket_id customer_name customer_email subject status createdAt updatedAt");

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: tickets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single ticket by ticket_id
// @route   GET /api/tickets/:ticket_id
// @access  Private
const getTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findOne({
      ticket_id: req.params.ticket_id,
    }).populate({
      path: "notes",
      select: "note_text created_at",
      options: { sort: { created_at: -1 } },
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: `Ticket ${req.params.ticket_id} not found.`,
      });
    }

    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update ticket status and/or add a note
// @route   PUT /api/tickets/:ticket_id
// @access  Private
const updateTicket = async (req, res, next) => {
  try {
    const { status, notes } = req.body;

    const ticket = await Ticket.findOne({ ticket_id: req.params.ticket_id });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: `Ticket ${req.params.ticket_id} not found.`,
      });
    }

    // Update status if provided
    if (status) {
      if (!["Open", "In Progress", "Closed"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status must be one of: Open, In Progress, Closed.",
        });
      }
      ticket.status = status;
    }

    // Add note if provided
    if (notes && notes.trim()) {
      const note = await Note.create({
        ticket_id: ticket._id,
        note_text: notes.trim(),
      });
      ticket.notes.push(note._id);
    }

    ticket.updatedAt = new Date();
    await ticket.save();

    res.status(200).json({
      success: true,
      message: "Ticket updated successfully.",
      updated_at: ticket.updatedAt,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/tickets/stats
// @access  Private
const getTicketStats = async (req, res, next) => {
  try {
    const [total, open, inProgress, closed, recent] = await Promise.all([
      Ticket.countDocuments(),
      Ticket.countDocuments({ status: "Open" }),
      Ticket.countDocuments({ status: "In Progress" }),
      Ticket.countDocuments({ status: "Closed" }),
      Ticket.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("ticket_id customer_name subject status createdAt"),
    ]);

    res.status(200).json({
      success: true,
      stats: { total, open, inProgress, closed },
      recentTickets: recent,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTicket,
  getAllTickets,
  getTicketById,
  updateTicket,
  getTicketStats,
};