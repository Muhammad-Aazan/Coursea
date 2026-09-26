const express = require("express");
const router = express.Router();
const {
  createCheckout,
  getMyPayments,
  getPaymentById,
  stripeWebhook,
  getSessionDetails,
  completeMockPayment,
  confirmSession
} = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");

// Stripe webhook (no JWT auth, verified by Stripe signature)
router.post("/webhook", stripeWebhook);

// Protected routes
router.post("/create-checkout", protect, createCheckout);
router.get("/my-payments", protect, getMyPayments);
router.get("/session/:sessionId", protect, getSessionDetails);
router.post("/complete-mock", protect, completeMockPayment);
router.post("/confirm-session", protect, confirmSession);
router.get("/:id", protect, getPaymentById);

module.exports = router;
