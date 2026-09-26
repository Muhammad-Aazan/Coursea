const Lesson = require("../models/Lesson");
const Section = require("../models/Section");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Progress = require("../models/Progress");

// @desc    Get lessons for a section
// @route   GET /api/sections/:sectionId/lessons
async function getLessonsBySection(req, res, next) {
  try {
    const { sectionId } = req.params;

    const section = await Section.findById(sectionId).populate("course");
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found"
      });
    }

    const lessons = await Lesson.find({ section: sectionId }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      message: "Lessons retrieved successfully",
      count: lessons.length,
      data: { lessons }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Get single lesson by ID (checks preview or enrollment)
// @route   GET /api/lessons/:id
async function getLessonById(req, res, next) {
  try {
    const lesson = await Lesson.findById(req.params.id).populate("course");

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found"
      });
    }

    // If it's a preview lesson, anyone can view it
    if (lesson.isPreview) {
      return res.status(200).json({
        success: true,
        message: "Lesson retrieved successfully",
        data: { lesson }
      });
    }

    // Non-preview lesson requires authentication
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to access this lesson"
      });
    }

    // Admin or course instructor have full access
    if (
      req.user.role === "admin" ||
      lesson.course.instructor.toString() === req.user._id.toString()
    ) {
      return res.status(200).json({
        success: true,
        message: "Lesson retrieved successfully",
        data: { lesson }
      });
    }

    // Check if course is free or student is enrolled
    if (lesson.course.price === 0) {
      return res.status(200).json({
        success: true,
        message: "Lesson retrieved successfully",
        data: { lesson }
      });
    }

    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: lesson.course._id
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in this course to access this lesson"
      });
    }

    res.status(200).json({
      success: true,
      message: "Lesson retrieved successfully",
      data: { lesson }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Get preview lesson (Public)
// @route   GET /api/lessons/:id/preview
async function getLessonPreview(req, res, next) {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found"
      });
    }

    if (!lesson.isPreview) {
      return res.status(403).json({
        success: false,
        message: "This lesson is not available for preview"
      });
    }

    res.status(200).json({
      success: true,
      message: "Preview lesson retrieved successfully",
      data: { lesson }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Create lesson for a section (Instructor only)
// @route   POST /api/sections/:sectionId/lessons
async function createLesson(req, res, next) {
  try {
    const { sectionId } = req.params;
    const { title, description, videoUrl, duration, order, isPreview } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Lesson title is required"
      });
    }

    const section = await Section.findById(sectionId).populate("course");
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found"
      });
    }

    // Check instructor authorization
    if (
      section.course.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to add lessons to this course"
      });
    }

    // Default order
    let lessonOrder = order;
    if (lessonOrder === undefined) {
      const count = await Lesson.countDocuments({ section: sectionId });
      lessonOrder = count + 1;
    }

    const lesson = await Lesson.create({
      section: sectionId,
      course: section.course._id,
      title: title.trim(),
      description: description || "",
      videoUrl: videoUrl || "",
      duration: duration !== undefined ? Number(duration) : 0,
      order: Number(lessonOrder),
      isPreview: Boolean(isPreview)
    });

    res.status(201).json({
      success: true,
      message: "Lesson created successfully",
      data: { lesson }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Update lesson
// @route   PATCH /api/lessons/:id
async function updateLesson(req, res, next) {
  try {
    const lesson = await Lesson.findById(req.params.id).populate("course");

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found"
      });
    }

    if (
      lesson.course.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this lesson"
      });
    }

    const fields = ["title", "description", "videoUrl", "duration", "order", "isPreview"];
    fields.forEach(f => {
      if (req.body[f] !== undefined) {
        lesson[f] = req.body[f];
      }
    });

    await lesson.save();

    res.status(200).json({
      success: true,
      message: "Lesson updated successfully",
      data: { lesson }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Delete lesson
// @route   DELETE /api/lessons/:id
async function deleteLesson(req, res, next) {
  try {
    const lesson = await Lesson.findById(req.params.id).populate("course");

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found"
      });
    }

    if (
      lesson.course.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this lesson"
      });
    }

    // Remove from any progress records
    await Progress.updateMany(
      { completedLessons: lesson._id },
      { $pull: { completedLessons: lesson._id } }
    );

    await Lesson.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Lesson deleted successfully"
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Update lesson order
// @route   PATCH /api/lessons/:id/order
async function updateLessonOrder(req, res, next) {
  try {
    const { order } = req.body;

    if (order === undefined) {
      return res.status(400).json({
        success: false,
        message: "Order value is required"
      });
    }

    const lesson = await Lesson.findById(req.params.id).populate("course");

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found"
      });
    }

    if (
      lesson.course.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this lesson"
      });
    }

    lesson.order = Number(order);
    await lesson.save();

    res.status(200).json({
      success: true,
      message: "Lesson order updated successfully",
      data: { lesson }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getLessonsBySection,
  getLessonById,
  getLessonPreview,
  createLesson,
  updateLesson,
  deleteLesson,
  updateLessonOrder
};
