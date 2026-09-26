const Course = require("../models/Course");
const Category = require("../models/Category");
const Section = require("../models/Section");
const Lesson = require("../models/Lesson");
const Enrollment = require("../models/Enrollment");
const Review = require("../models/Review");
const Payment = require("../models/Payment");

// @desc    Get published courses with search, filter, and sorting
// @route   GET /api/courses
async function getCourses(req, res, next) {
  try {
    const { search, category, level, minPrice, maxPrice, sort } = req.query;

    const query = { published: true };

    // Search by keyword in title or description
    if (search) {
      query.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } }
      ];
    }

    // Category filter (support category ObjectId or category name)
    if (category) {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const foundCategory = await Category.findOne({
          name: { $regex: new RegExp(`^${category.trim()}$`, "i") }
        });
        if (foundCategory) {
          query.category = foundCategory._id;
        }
      }
    }

    // Level filter
    if (level && ["beginner", "intermediate", "advanced", "all"].includes(level)) {
      query.level = level;
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined && !isNaN(minPrice)) query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined && !isNaN(maxPrice)) query.price.$lte = Number(maxPrice);
    }

    // Sort options
    let sortQuery = { createdAt: -1 };
    if (sort === "price") {
      sortQuery = { price: 1 };
    } else if (sort === "-price") {
      sortQuery = { price: -1 };
    } else if (sort === "oldest") {
      sortQuery = { createdAt: 1 };
    } else if (sort === "title") {
      sortQuery = { title: 1 };
    }

    const courses = await Course.find(query)
      .populate("instructor", "name profileImage")
      .populate("category", "name")
      .sort(sortQuery);

    res.status(200).json({
      success: true,
      message: "Courses retrieved successfully",
      count: courses.length,
      data: { courses }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Get course details with sections and lessons
// @route   GET /api/courses/:id
async function getCourseById(req, res, next) {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "name profileImage email")
      .populate("category", "name");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    // Fetch sections and their lessons
    const sections = await Section.find({ course: course._id }).sort({ order: 1 });
    const sectionIds = sections.map(s => s._id);
    const lessons = await Lesson.find({ section: { $in: sectionIds } }).sort({ order: 1 });

    // Attach lessons to each section
    const sectionsWithLessons = sections.map(sec => {
      const secObj = sec.toObject();
      secObj.lessons = lessons.filter(
        l => l.section.toString() === sec._id.toString()
      );
      return secObj;
    });

    // Calculate rating stats
    const reviews = await Review.find({ course: course._id });
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
        : 0;

    res.status(200).json({
      success: true,
      message: "Course retrieved successfully",
      data: {
        course,
        sections: sectionsWithLessons,
        stats: {
          totalSections: sections.length,
          totalLessons: lessons.length,
          totalReviews: reviews.length,
          averageRating: Number(averageRating.toFixed(1))
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Create course (Instructor only)
// @route   POST /api/courses
async function createCourse(req, res, next) {
  try {
    const {
      title,
      description,
      thumbnail,
      price,
      category,
      requirements,
      whatYouWillLearn,
      level,
      language
    } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and category are required"
      });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    const course = await Course.create({
      title: title.trim(),
      description,
      thumbnail: thumbnail || "",
      price: price !== undefined ? Number(price) : 0,
      instructor: req.user._id,
      category,
      requirements: requirements || [],
      whatYouWillLearn: whatYouWillLearn || [],
      level: level || "all",
      language: language || "English",
      published: false
    });

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: { course }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Update course (Instructor updates own course)
// @route   PATCH /api/courses/:id
async function updateCourse(req, res, next) {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    // Check ownership (instructor or admin)
    if (
      course.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this course"
      });
    }

    const fieldsToUpdate = [
      "title",
      "description",
      "thumbnail",
      "price",
      "category",
      "requirements",
      "whatYouWillLearn",
      "level",
      "language",
      "published"
    ];

    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        course[field] = req.body[field];
      }
    });

    await course.save();

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: { course }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Delete course (Instructor deletes own course)
// @route   DELETE /api/courses/:id
async function deleteCourse(req, res, next) {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    // Check ownership
    if (
      course.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this course"
      });
    }

    // Delete associated sections and lessons
    await Lesson.deleteMany({ course: course._id });
    await Section.deleteMany({ course: course._id });
    await Course.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Course and its sections/lessons deleted successfully"
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Instructor gets own courses
// @route   GET /api/courses/my-courses
async function getMyCourses(req, res, next) {
  try {
    const courses = await Course.find({ instructor: req.user._id })
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Instructor courses retrieved successfully",
      count: courses.length,
      data: { courses }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Publish / Unpublish course
// @route   PATCH /api/courses/:id/publish
async function togglePublishCourse(req, res, next) {
  try {
    const course = await Course.findById(req.params.id);

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
        message: "Not authorized to modify this course"
      });
    }

    course.published =
      req.body.published !== undefined ? req.body.published : !course.published;

    await course.save();

    res.status(200).json({
      success: true,
      message: `Course ${course.published ? "published" : "unpublished"} successfully`,
      data: { course }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Get courses of an instructor
// @route   GET /api/instructors/:id/courses
async function getInstructorCourses(req, res, next) {
  try {
    const courses = await Course.find({
      instructor: req.params.id,
      published: true
    })
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Instructor courses retrieved successfully",
      count: courses.length,
      data: { courses }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Instructor gets enrolled students for course
// @route   GET /api/courses/:id/students
async function getCourseStudents(req, res, next) {
  try {
    const course = await Course.findById(req.params.id);

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
        message: "Not authorized to view students for this course"
      });
    }

    const enrollments = await Enrollment.find({ course: course._id })
      .populate("student", "name email profileImage")
      .sort({ enrolledAt: -1 });

    res.status(200).json({
      success: true,
      message: "Enrolled students retrieved successfully",
      count: enrollments.length,
      data: {
        enrollments
      }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Get simple course statistics
// @route   GET /api/courses/:id/stats
async function getCourseStats(req, res, next) {
  try {
    const course = await Course.findById(req.params.id);

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
        message: "Not authorized to view stats for this course"
      });
    }

    const totalStudents = await Enrollment.countDocuments({ course: course._id });
    const reviews = await Review.find({ course: course._id });
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
        : 0;

    const payments = await Payment.find({
      course: course._id,
      status: "completed"
    });
    const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);

    res.status(200).json({
      success: true,
      message: "Course statistics retrieved successfully",
      data: {
        courseId: course._id,
        courseTitle: course.title,
        totalStudents,
        totalReviews: reviews.length,
        averageRating: Number(avgRating.toFixed(1)),
        totalRevenue
      }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Get instructor overall dashboard statistics (courses, students, earnings)
// @route   GET /api/courses/instructor-stats
async function getInstructorStats(req, res, next) {
  try {
    const instructorId = req.user._id;

    // Courses by this instructor
    const courses = await Course.find({ instructor: instructorId })
      .populate("category", "name")
      .sort({ createdAt: -1 });

    const courseIds = courses.map((c) => c._id);

    // Total enrolled students across all courses
    const totalStudents = await Enrollment.countDocuments({
      course: { $in: courseIds }
    });

    // Earnings aggregation
    const earningsAgg = await Payment.aggregate([
      {
        $match: {
          $or: [
            { instructor: instructorId, status: "completed" },
            { course: { $in: courseIds }, status: "completed" }
          ]
        }
      },
      {
        $group: {
          _id: null,
          grossSales: { $sum: "$amount" },
          netEarnings: { $sum: "$instructorEarnings" },
          platformFees: { $sum: "$platformFee" },
          salesCount: { $sum: 1 }
        }
      }
    ]);

    const grossSales = earningsAgg.length > 0 ? earningsAgg[0].grossSales : 0;
    let netEarnings = earningsAgg.length > 0 ? earningsAgg[0].netEarnings : 0;
    let platformFees = earningsAgg.length > 0 ? earningsAgg[0].platformFees : 0;
    const salesCount = earningsAgg.length > 0 ? earningsAgg[0].salesCount : 0;

    // Fallback if older test payments didn't have commission fields populated
    if (grossSales > 0 && netEarnings === 0) {
      platformFees = Number((grossSales * 0.15).toFixed(2));
      netEarnings = Number((grossSales - platformFees).toFixed(2));
    }

    res.status(200).json({
      success: true,
      message: "Instructor statistics retrieved successfully",
      data: {
        totalCourses: courses.length,
        publishedCount: courses.filter((c) => c.published).length,
        draftCount: courses.filter((c) => !c.published).length,
        totalStudents,
        salesCount,
        grossSales: Number(grossSales.toFixed(2)),
        netEarnings: Number(netEarnings.toFixed(2)),
        platformFees: Number(platformFees.toFixed(2)),
        commissionRate: 0.15,
        courses
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
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
};
