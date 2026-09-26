const express = require("express");
const router = express.Router();
const { getInstructorCourses } = require("../controllers/courseController");
const { getInstructorPublicProfile } = require("../controllers/userController");

router.get("/:id/courses", getInstructorCourses);
router.get("/:id/public", getInstructorPublicProfile);

module.exports = router;
