const express = require("express");
const router = express.Router();
const {
  getCourseProgress,
  markLessonCompleted,
  markLessonIncomplete,
  getCompletedLessons
} = require("../controllers/progressController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/:courseId/completed-lessons", getCompletedLessons);
router.get("/:courseId", getCourseProgress);
router.post("/:lessonId", markLessonCompleted);
router.delete("/:lessonId", markLessonIncomplete);

module.exports = router;
