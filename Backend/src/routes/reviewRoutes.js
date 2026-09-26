const express = require("express");
const router = express.Router();
const {
  getCourseReviews,
  createReview,
  getReviewById,
  updateReview,
  deleteReview
} = require("../controllers/reviewController");
const { protect } = require("../middleware/auth");

// Routes under /api/courses/:courseId/reviews
router.get("/courses/:courseId/reviews", getCourseReviews);
router.post("/courses/:courseId/reviews", protect, createReview);

// Routes under /api/reviews/:id
router.get("/:id", getReviewById);
router.patch("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);

module.exports = router;
