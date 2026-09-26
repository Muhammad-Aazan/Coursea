const express = require("express");
const router = express.Router();
const {
  getSectionsByCourse,
  createSection,
  updateSection,
  deleteSection,
  updateSectionOrder
} = require("../controllers/sectionController");
const {
  getLessonsBySection,
  createLesson
} = require("../controllers/lessonController");
const { protect, instructorMiddleware } = require("../middleware/auth");

// Lessons under section: GET /api/sections/:sectionId/lessons and POST /api/sections/:sectionId/lessons
router.get("/:sectionId/lessons", getLessonsBySection);
router.post("/:sectionId/lessons", protect, instructorMiddleware, createLesson);

// Section order and management under /api/sections/:id
router.patch("/:id/order", protect, instructorMiddleware, updateSectionOrder);
router.patch("/:id", protect, instructorMiddleware, updateSection);
router.delete("/:id", protect, instructorMiddleware, deleteSection);

module.exports = router;
