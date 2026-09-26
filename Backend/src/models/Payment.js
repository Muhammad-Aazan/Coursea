const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student reference is required"]
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course reference is required"]
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    stripeSessionId: {
      type: String,
      default: ""
    },
    amount: {
      type: Number,
      required: [true, "Payment amount is required"]
    },
    platformFee: {
      type: Number,
      default: 0
    },
    instructorEarnings: {
      type: Number,
      default: 0
    },
    commissionRate: {
      type: Number,
      default: 0.15
    },
    currency: {
      type: String,
      default: "usd"
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending"
    }
  },
  {
    timestamps: true
  }
);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
