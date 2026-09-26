const Review = require("../models/Review");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");

// @desc    Get reviews for a course
// @route   GET /api/courses/:courseId/reviews
async function getCourseReviews(req, res, next) {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    const reviews = await Review.find({ course: courseId })
      .populate("student", "name profileImage")
      .sort({ createdAt: -1 });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
        : 0;

    res.status(200).json({
      success: true,
      message: "Course reviews retrieved successfully",
      count: reviews.length,
      averageRating: Number(avgRating.toFixed(1)),
      data: { reviews }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Create review (Enrolled students only)
// @route   POST /api/courses/:courseId/reviews
async function createReview(req, res, next) {
  try {
    const { courseId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Rating (1-5) and comment are required"
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    // Verify enrollment
    const isEnrolled = await Enrollment.findOne({
      student: req.user._id,
      course: courseId
    });

    if (!isEnrolled && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only enrolled students can review a course"
      });
    }

    // Check for existing review
    const existingReview = await Review.findOne({
      student: req.user._id,
      course: courseId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this course"
      });
    }

    const review = await Review.create({
      student: req.user._id,
      course: courseId,
      rating: Number(rating),
      comment: comment.trim()
    });

    await updateCourseRatingStats(courseId);

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: { review }
    });
  } catch (error) {
    next(error);
  }
}

async function updateCourseRatingStats(courseId) {
  try {
    const reviews = await Review.find({ course: courseId });
    const totalRatings = reviews.length;
    const avg = totalRatings > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalRatings
      : 0;
    await Course.findByIdAndUpdate(courseId, {
      rating: Number(avg.toFixed(1)),
      totalRatings
    });
  } catch (err) {
    console.error("Error updating course rating stats:", err);
  }
}

// @desc    Get single review by ID
// @route   GET /api/reviews/:id
async function getReviewById(req, res, next) {
  try {
    const review = await Review.findById(req.params.id)
      .populate("student", "name profileImage")
      .populate("course", "title thumbnail");

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Review retrieved successfully",
      data: { review }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Update own review
// @route   PATCH /api/reviews/:id
async function updateReview(req, res, next) {
  try {
    const { rating, comment } = req.body;

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    // Check ownership
    if (
      review.student.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this review"
      });
    }

    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5"
        });
      }
      review.rating = Number(rating);
    }

    if (comment) {
      review.comment = comment.trim();
    }

    await review.save();
    await updateCourseRatingStats(review.course);

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: { review }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Delete own review
// @route   DELETE /api/reviews/:id
async function deleteReview(req, res, next) {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    // Check ownership
    if (
      review.student.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this review"
      });
    }

    const courseId = review.course;
    await Review.findByIdAndDelete(req.params.id);
    await updateCourseRatingStats(courseId);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully"
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCourseReviews,
  createReview,
  getReviewById,
  updateReview,
  deleteReview
};
