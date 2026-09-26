const Section = require("../models/Section");
const Course = require("../models/Course");
const Lesson = require("../models/Lesson");

// @desc    Get all sections for a course
// @route   GET /api/courses/:courseId/sections
async function getSectionsByCourse(req, res, next) {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    const sections = await Section.find({ course: courseId }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      message: "Sections retrieved successfully",
      count: sections.length,
      data: { sections }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Create section for a course
// @route   POST /api/courses/:courseId/sections
async function createSection(req, res, next) {
  try {
    const { courseId } = req.params;
    const { title, order } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Section title is required"
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    // Check authorization: instructor of the course or admin
    if (
      course.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to add sections to this course"
      });
    }

    // Default order to next available
    let sectionOrder = order;
    if (sectionOrder === undefined) {
      const count = await Section.countDocuments({ course: courseId });
      sectionOrder = count + 1;
    }

    const section = await Section.create({
      course: courseId,
      title: title.trim(),
      order: Number(sectionOrder)
    });

    res.status(201).json({
      success: true,
      message: "Section created successfully",
      data: { section }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Update section
// @route   PATCH /api/sections/:id
async function updateSection(req, res, next) {
  try {
    const { title } = req.body;
    const section = await Section.findById(req.params.id).populate("course");

    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found"
      });
    }

    if (
      section.course.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this section"
      });
    }

    if (title) section.title = title.trim();
    await section.save();

    res.status(200).json({
      success: true,
      message: "Section updated successfully",
      data: { section }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Delete section
// @route   DELETE /api/sections/:id
async function deleteSection(req, res, next) {
  try {
    const section = await Section.findById(req.params.id).populate("course");

    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found"
      });
    }

    if (
      section.course.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this section"
      });
    }

    // Delete associated lessons
    await Lesson.deleteMany({ section: section._id });
    await Section.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Section and its lessons deleted successfully"
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Update section order
// @route   PATCH /api/sections/:id/order
async function updateSectionOrder(req, res, next) {
  try {
    const { order } = req.body;

    if (order === undefined) {
      return res.status(400).json({
        success: false,
        message: "Order value is required"
      });
    }

    const section = await Section.findById(req.params.id).populate("course");
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found"
      });
    }

    if (
      section.course.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this section order"
      });
    }

    section.order = Number(order);
    await section.save();

    res.status(200).json({
      success: true,
      message: "Section order updated successfully",
      data: { section }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSectionsByCourse,
  createSection,
  updateSection,
  deleteSection,
  updateSectionOrder
};
