const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    ticket_id: {
      type: String,
      unique: true,
    },
    customer_name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    customer_email: {
      type: String,
      required: [true, "Customer email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Closed"],
      default: "Open",
    },
    notes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Note",
      },
    ],
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

// Auto-generate ticket_id before saving
ticketSchema.pre("save", async function (next) {
  if (this.ticket_id) return next();

  try {
    const count = await mongoose.model("Ticket").countDocuments();
    this.ticket_id = `TKT-${String(count + 1).padStart(3, "0")}`;
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Ticket", ticketSchema);