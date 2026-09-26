const Wishlist = require("../models/Wishlist");
const Course = require("../models/Course");

// @desc    Get logged-in user's wishlist
// @route   GET /api/wishlist
async function getWishlist(req, res, next) {
  try {
    const wishlist = await Wishlist.find({ student: req.user._id })
      .populate({
        path: "course",
        populate: [
          { path: "instructor", select: "name profileImage" },
          { path: "category", select: "name" }
        ]
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Wishlist retrieved successfully",
      count: wishlist.length,
      data: { wishlist }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Add course to wishlist
// @route   POST /api/wishlist/:courseId
async function addToWishlist(req, res, next) {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    const existingItem = await Wishlist.findOne({
      student: req.user._id,
      course: courseId
    });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: "Course is already in your wishlist"
      });
    }

    const wishlistItem = await Wishlist.create({
      student: req.user._id,
      course: courseId
    });

    res.status(201).json({
      success: true,
      message: "Course added to wishlist",
      data: { wishlistItem }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Remove course from wishlist
// @route   DELETE /api/wishlist/:courseId
async function removeFromWishlist(req, res, next) {
  try {
    const { courseId } = req.params;

    const item = await Wishlist.findOneAndDelete({
      student: req.user._id,
      course: courseId
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Course not found in your wishlist"
      });
    }

    res.status(200).json({
      success: true,
      message: "Course removed from wishlist"
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Check whether course exists in wishlist
// @route   GET /api/wishlist/:courseId/check
async function checkWishlist(req, res, next) {
  try {
    const { courseId } = req.params;

    const item = await Wishlist.findOne({
      student: req.user._id,
      course: courseId
    });

    res.status(200).json({
      success: true,
      message: "Wishlist check completed",
      data: {
        inWishlist: !!item
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist
};
