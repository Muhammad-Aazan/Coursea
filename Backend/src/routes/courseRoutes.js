const express = require("express");
const router = express.Router();
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getMyCourses,
  togglePublishCourse,
  getInstructorCourses,
  getCourseStudents,
  getCourseStats,
  getInstructorStats
} = require("../controllers/courseController");
const { getCourseEnrollments } = require("../controllers/enrollmentController");
const { getCourseReviews, createReview } = require("../controllers/reviewController");
const { getSectionsByCourse, createSection } = require("../controllers/sectionController");
const { protect, instructorMiddleware } = require("../middleware/auth");

// Public routes
router.get("/", getCourses);
router.get("/my-courses", protect, instructorMiddleware, getMyCourses);
router.get("/instructor-stats", protect, instructorMiddleware, getInstructorStats);
router.get("/:id", getCourseById);
router.get("/instructors/:id/courses", getInstructorCourses);
router.get("/:courseId/reviews", getCourseReviews);
router.get("/:courseId/sections", getSectionsByCourse);

// Protected routes
router.post("/:courseId/reviews", protect, createReview);
router.post("/:courseId/sections", protect, instructorMiddleware, createSection);


// Instructor routes
router.post("/", protect, instructorMiddleware, createCourse);
router.patch("/:id", protect, instructorMiddleware, updateCourse);
router.delete("/:id", protect, instructorMiddleware, deleteCourse);
router.patch("/:id/publish", protect, instructorMiddleware, togglePublishCourse);
router.get("/:id/students", protect, instructorMiddleware, getCourseStudents);
router.get("/:courseId/enrollments", protect, instructorMiddleware, getCourseEnrollments);
router.get("/:id/stats", protect, instructorMiddleware, getCourseStats);



module.exports = router;
