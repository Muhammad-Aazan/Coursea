const Progress = require("../models/Progress");
const Enrollment = require("../models/Enrollment");
const Lesson = require("../models/Lesson");
const Course = require("../models/Course");

// Helper function to recalculate percentage and update both Progress and Enrollment
async function syncCourseProgress(studentId, courseId) {
  const totalLessons = await Lesson.countDocuments({ course: courseId });
  const progress = await Progress.findOne({ student: studentId, course: courseId });

  if (!progress) return 0;

  const completedCount = progress.completedLessons.length;
  const percentage =
    totalLessons > 0 ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 0;

  progress.percentage = percentage;
  await progress.save();

  // Sync to enrollment record as well
  await Enrollment.findOneAndUpdate(
    { student: studentId, course: courseId },
    { progress: percentage }
  );

  return percentage;
}

// @desc    Get student's course progress
// @route   GET /api/progress/:courseId
async function getCourseProgress(req, res, next) {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    let progress = await Progress.findOne({
      student: req.user._id,
      course: courseId
    });

    if (!progress) {
      progress = await Progress.create({
        student: req.user._id,
        course: courseId,
        completedLessons: [],
        percentage: 0
      });
    }

    const totalLessons = await Lesson.countDocuments({ course: courseId });

    res.status(200).json({
      success: true,
      message: "Progress retrieved successfully",
      data: {
        progress,
        totalLessons,
        completedCount: progress.completedLessons.length
      }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Mark lesson as completed
// @route   POST /api/progress/:lessonId
async function markLessonCompleted(req, res, next) {
  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found"
      });
    }

    // Check enrollment
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: lesson.course
    });

    if (!enrollment && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in the course to update lesson progress"
      });
    }

    let progress = await Progress.findOne({
      student: req.user._id,
      course: lesson.course
    });

    if (!progress) {
      progress = await Progress.create({
        student: req.user._id,
        course: lesson.course,
        completedLessons: [],
        percentage: 0
      });
    }

    // Add lesson if not already marked completed
    if (!progress.completedLessons.some(id => id.toString() === lessonId.toString())) {
      progress.completedLessons.push(lessonId);
      await progress.save();
    }

    const percentage = await syncCourseProgress(req.user._id, lesson.course);

    res.status(200).json({
      success: true,
      message: "Lesson marked as completed",
      data: {
        lessonId,
        percentage,
        completedLessons: progress.completedLessons
      }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Mark lesson as incomplete
// @route   DELETE /api/progress/:lessonId
async function markLessonIncomplete(req, res, next) {
  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found"
      });
    }

    let progress = await Progress.findOne({
      student: req.user._id,
      course: lesson.course
    });

    if (progress) {
      progress.completedLessons = progress.completedLessons.filter(
        id => id.toString() !== lessonId.toString()
      );
      await progress.save();
    }

    const percentage = await syncCourseProgress(req.user._id, lesson.course);

    res.status(200).json({
      success: true,
      message: "Lesson marked as incomplete",
      data: {
        lessonId,
        percentage,
        completedLessons: progress ? progress.completedLessons : []
      }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Get completed lessons for a course
// @route   GET /api/progress/:courseId/completed-lessons
async function getCompletedLessons(req, res, next) {
  try {
    const { courseId } = req.params;

    const progress = await Progress.findOne({
      student: req.user._id,
      course: courseId
    }).populate("completedLessons", "title duration isPreview");

    res.status(200).json({
      success: true,
      message: "Completed lessons retrieved successfully",
      data: {
        completedLessons: progress ? progress.completedLessons : [],
        percentage: progress ? progress.percentage : 0
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCourseProgress,
  markLessonCompleted,
  markLessonIncomplete,
  getCompletedLessons
};
