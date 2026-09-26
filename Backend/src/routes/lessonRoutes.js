const express = require("express");
const router = express.Router();
const {
  getLessonsBySection,
  getLessonById,
  getLessonPreview,
  createLesson,
  updateLesson,
  deleteLesson,
  updateLessonOrder
} = require("../controllers/lessonController");
const {
  protect,
  optionalAuth,
  instructorMiddleware
} = require("../middleware/auth");

// Routes under /api/sections/:sectionId/lessons
router.get("/sections/:sectionId/lessons", getLessonsBySection);
router.post(
  "/sections/:sectionId/lessons",
  protect,
  instructorMiddleware,
  createLesson
);

// Preview route (public)
router.get("/:id/preview", getLessonPreview);

// Single lesson route (optional auth to verify enrollment if not preview)
router.get("/:id", optionalAuth, getLessonById);

// Instructor routes
router.patch("/:id", protect, instructorMiddleware, updateLesson);
router.delete("/:id", protect, instructorMiddleware, deleteLesson);
router.patch("/:id/order", protect, instructorMiddleware, updateLessonOrder);

module.exports = router;
