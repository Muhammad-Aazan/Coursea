const Category = require("../models/Category");
const Course = require("../models/Course");

// @desc    Get all categories
// @route   GET /api/categories
async function getCategories(req, res, next) {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json({
      success: true,
      message: "Categories retrieved successfully",
      count: categories.length,
      data: { categories }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Get one category
// @route   GET /api/categories/:id
async function getCategoryById(req, res, next) {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Category retrieved successfully",
      data: { category }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Create category (Admin only)
// @route   POST /api/categories
async function createCategory(req, res, next) {
  try {
    const { name, description, image } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required"
      });
    }

    const existingCategory = await Category.findOne({ name: name.trim() });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category already exists"
      });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description || "",
      image: image || ""
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: { category }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Update category (Admin only)
// @route   PATCH /api/categories/:id
async function updateCategory(req, res, next) {
  try {
    const { name, description, image } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    if (name) category.name = name.trim();
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: { category }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Delete category (Admin only)
// @route   DELETE /api/categories/:id
async function deleteCategory(req, res, next) {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    // Check if courses are using this category
    const coursesCount = await Course.countDocuments({ category: req.params.id });
    if (coursesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category that has ${coursesCount} associated course(s)`
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully"
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Get courses in a category
// @route   GET /api/categories/:id/courses
async function getCategoryCourses(req, res, next) {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    const courses = await Course.find({
      category: req.params.id,
      published: true
    })
      .populate("instructor", "name profileImage")
      .populate("category", "name");

    res.status(200).json({
      success: true,
      message: "Category courses retrieved successfully",
      count: courses.length,
      data: {
        category,
        courses
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryCourses
};
