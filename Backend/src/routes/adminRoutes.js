const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getAdminUsers,
  getAdminCourses,
  getAdminEnrollments,
  getAdminPayments,
  getAdminReviews,
  deleteAdminReview,
  approveCourse,
  rejectCourse
} = require("../controllers/adminController");
const { protect, adminMiddleware } = require("../middleware/auth");

router.use(protect, adminMiddleware);

router.get("/dashboard", getDashboardStats);
router.get("/users", getAdminUsers);
router.get("/courses", getAdminCourses);
router.get("/enrollments", getAdminEnrollments);
router.get("/payments", getAdminPayments);
router.get("/reviews", getAdminReviews);
router.delete("/reviews/:id", deleteAdminReview);
router.patch("/courses/:id/approve", approveCourse);
router.patch("/courses/:id/reject", rejectCourse);

module.exports = router;
