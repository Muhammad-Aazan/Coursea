const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const {
  createEnrollment,
  getMyEnrollments,
  checkEnrollment,
  getCourseEnrollments,
  getEnrollmentById
} = require("../controllers/enrollmentController");
const { protect, instructorMiddleware } = require("../middleware/auth");

router.use(protect);

router.post("/", createEnrollment);
router.get("/my-courses", getMyEnrollments);
router.get("/check/:courseId", checkEnrollment);
router.get("/detail/:id", getEnrollmentById);

// Combined handler for /:idOrCourseId to support both GET /api/enrollments/:courseId and GET /api/enrollments/:id
router.get("/:idOrCourseId", async (req, res, next) => {
  try {
    const { idOrCourseId } = req.params;

    // Check if it corresponds to a course to check enrollment
    const isCourse = await Course.exists({ _id: idOrCourseId });
    if (isCourse) {
      req.params.courseId = idOrCourseId;
      return checkEnrollment(req, res, next);
    }

    // Otherwise check as enrollment ID
    const isEnrollment = await Enrollment.exists({ _id: idOrCourseId });
    if (isEnrollment) {
      req.params.id = idOrCourseId;
      return getEnrollmentById(req, res, next);
    }

    // Default to checkEnrollment
    req.params.courseId = idOrCourseId;
    return checkEnrollment(req, res, next);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
