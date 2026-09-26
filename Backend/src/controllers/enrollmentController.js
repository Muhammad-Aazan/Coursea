const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const Payment = require("../models/Payment");
const Progress = require("../models/Progress");
const createNotification = require("../utils/createNotification");

// @desc    Create enrollment (for free course or after payment)
// @route   POST /api/enrollments
async function createEnrollment(req, res, next) {
  try {
    const { courseId, paymentId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required"
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: "You are already enrolled in this course"
      });
    }

    let paymentRecord = null;

    // If paid course, verify payment
    if (course.price > 0) {
      if (!paymentId) {
        return res.status(400).json({
          success: false,
          message: "Payment ID is required for paid courses"
        });
      }

      paymentRecord = await Payment.findOne({
        _id: paymentId,
        student: req.user._id,
        course: courseId,
        status: "completed"
      });

      if (!paymentRecord) {
        return res.status(400).json({
          success: false,
          message: "Valid completed payment required for enrollment"
        });
      }
    }

    const enrollment = await Enrollment.create({
      student: req.user._id,
      course: courseId,
      payment: paymentRecord ? paymentRecord._id : null,
      progress: 0
    });

    // Initialize progress record if not exists
    await Progress.findOneAndUpdate(
      { student: req.user._id, course: courseId },
      {
        student: req.user._id,
        course: courseId,
        completedLessons: [],
        percentage: 0
      },
      { upsert: true, returnDocument: "after" }
    );

    // Notify instructor about new enrollment
    const courseDoc = await Course.findById(courseId).select('instructor title');
    if (courseDoc && courseDoc.instructor) {
      await createNotification({
        recipient: courseDoc.instructor,
        type: 'new_enrollment',
        title: 'New Student Enrolled',
        message: `A new student has enrolled in your course: ${courseDoc.title}`,
        link: `/instructor/students/${courseId}`
      });
    }

    res.status(201).json({
      success: true,
      message: "Enrolled successfully",
      data: { enrollment }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Get logged-in student's enrolled courses
// @route   GET /api/enrollments/my-courses
async function getMyEnrollments(req, res, next) {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate({
        path: "course",
        populate: [
          { path: "instructor", select: "name profileImage" },
          { path: "category", select: "name" }
        ]
      })
      .sort({ enrolledAt: -1 });

    res.status(200).json({
      success: true,
      message: "Enrolled courses retrieved successfully",
      count: enrollments.length,
      data: { enrollments }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Check whether student is enrolled in a course
// @route   GET /api/enrollments/check/:courseId or GET /api/enrollments/:courseId
async function checkEnrollment(req, res, next) {
  try {
    const { courseId } = req.params;

    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId
    });

    res.status(200).json({
      success: true,
      message: "Enrollment status checked",
      data: {
        isEnrolled: !!enrollment,
        enrollment: enrollment || null
      }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Get course enrollments (Instructor or Admin)
// @route   GET /api/courses/:courseId/enrollments
async function getCourseEnrollments(req, res, next) {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    if (
      course.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view enrollments for this course"
      });
    }

    const enrollments = await Enrollment.find({ course: courseId })
      .populate("student", "name email profileImage")
      .populate("payment")
      .sort({ enrolledAt: -1 });

    res.status(200).json({
      success: true,
      message: "Course enrollments retrieved successfully",
      count: enrollments.length,
      data: { enrollments }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Get enrollment details by ID
// @route   GET /api/enrollments/detail/:id or GET /api/enrollments/:id
async function getEnrollmentById(req, res, next) {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate("course")
      .populate("student", "name email profileImage")
      .populate("payment");

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found"
      });
    }

    // Check authorization
    if (
      enrollment.student._id.toString() !== req.user._id.toString() &&
      enrollment.course.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this enrollment"
      });
    }

    res.status(200).json({
      success: true,
      message: "Enrollment retrieved successfully",
      data: { enrollment }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createEnrollment,
  getMyEnrollments,
  checkEnrollment,
  getCourseEnrollments,
  getEnrollmentById
};
