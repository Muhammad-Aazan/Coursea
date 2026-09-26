const express = require("express");
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryCourses
} = require("../controllers/categoryController");
const { protect, adminMiddleware } = require("../middleware/auth");

router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.get("/:id/courses", getCategoryCourses);

// Admin only routes
router.post("/", protect, adminMiddleware, createCategory);
router.patch("/:id", protect, adminMiddleware, updateCategory);
router.delete("/:id", protect, adminMiddleware, deleteCategory);

module.exports = router;
