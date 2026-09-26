const User = require("../models/User");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Payment = require("../models/Payment");
const Review = require("../models/Review");

async function getDashboardStats(req, res, next) {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalInstructors = await User.countDocuments({ role: "instructor" });
    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({ published: true });
    const totalEnrollments = await Enrollment.countDocuments();
    const totalPayments = await Payment.countDocuments({ status: "completed" });

    const revenueResult = await Payment.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: null,
          totalGross: { $sum: "$amount" },
          totalPlatform: { $sum: "$platformFee" },
          totalInstructor: { $sum: "$instructorEarnings" }
        }
      }
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalGross : 0;
    let platformRevenue = revenueResult.length > 0 ? revenueResult[0].totalPlatform : 0;
    let instructorPayouts = revenueResult.length > 0 ? revenueResult[0].totalInstructor : 0;

    // Fallback if older test payments didn't have commission fields populated
    if (totalRevenue > 0 && platformRevenue === 0) {
      platformRevenue = Number((totalRevenue * 0.15).toFixed(2));
      instructorPayouts = Number((totalRevenue - platformRevenue).toFixed(2));
    }

    res.status(200).json({
      success: true,
      message: "Admin dashboard statistics retrieved successfully",
      data: {
        totalUsers,
        totalStudents,
        totalInstructors,
        totalCourses,
        publishedCourses,
        totalEnrollments,
        totalPayments,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        platformRevenue: Number(platformRevenue.toFixed(2)),
        instructorPayouts: Number(instructorPayouts.toFixed(2)),
        commissionRate: 0.15
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getAdminUsers(req, res, next) {
  try {
    const { role } = req.query;
    const filter = {};
    if (role) filter.role = role;

    const users = await User.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
}

async function getAdminCourses(req, res, next) {
  try {
    const courses = await Course.find()
      .populate("instructor", "name email")
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Admin courses retrieved successfully",
      count: courses.length,
      data: courses
    });
  } catch (error) {
    next(error);
  }
}

async function getAdminEnrollments(req, res, next) {
  try {
    const enrollments = await Enrollment.find()
      .populate("student", "name email")
      .populate("course", "title price")
      .populate("payment")
      .sort({ enrolledAt: -1 });

    res.status(200).json({
      success: true,
      message: "Admin enrollments retrieved successfully",
      count: enrollments.length,
      data: { enrollments }
    });
  } catch (error) {
    next(error);
  }
}

async function getAdminPayments(req, res, next) {
  try {
    const payments = await Payment.find()
      .populate("student", "name email")
      .populate("course", "title price")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Admin payments retrieved successfully",
      count: payments.length,
      data: { payments }
    });
  } catch (error) {
    next(error);
  }
}

async function getAdminReviews(req, res, next) {
  try {
    const reviews = await Review.find()
      .populate("student", "name email")
      .populate("course", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Admin reviews retrieved successfully",
      count: reviews.length,
      data: { reviews }
    });
  } catch (error) {
    next(error);
  }
}

async function deleteAdminReview(req, res, next) {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully by admin"
    });
  } catch (error) {
    next(error);
  }
}

async function approveCourse(req, res, next) {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    course.approved = true;
    course.published = true;
    await course.save();

    res.status(200).json({
      success: true,
      message: "Course approved and published successfully",
      data: { course }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Reject course
// @route   PATCH /api/admin/courses/:id/reject
async function rejectCourse(req, res, next) {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    course.approved = false;
    course.published = false;
    await course.save();

    res.status(200).json({
      success: true,
      message: "Course rejected and unpublished successfully",
      data: { course }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardStats,
  getAdminUsers,
  getAdminCourses,
  getAdminEnrollments,
  getAdminPayments,
  getAdminReviews,
  deleteAdminReview,
  approveCourse,
  rejectCourse
};
