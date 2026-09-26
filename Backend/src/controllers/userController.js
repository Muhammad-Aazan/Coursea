const User = require("../models/User");
const Course = require("../models/Course");

// @desc    Get all users (Admin only)
// @route   GET /api/users
async function getAllUsers(req, res, next) {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      count: users.length,
      data: { users }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Get one user (Admin only)
// @route   GET /api/users/:id
async function getUserById(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: { user }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Update user (Admin only)
// @route   PATCH /api/users/:id
async function updateUser(req, res, next) {
  try {
    const { name, email, profileImage } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (name) user.name = name.trim();
    if (email) user.email = email.toLowerCase().trim();
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: { user }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
async function deleteUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Prevent deleting own account via this endpoint
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Admin cannot delete their own account"
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Change user role (Admin only)
// @route   PATCH /api/users/:id/role
async function changeUserRole(req, res, next) {
  try {
    const { role } = req.body;

    if (!role || !["student", "instructor", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Valid role is required (student, instructor, admin)"
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role changed to ${role} successfully`,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Get public instructor profile
// @route   GET /api/instructors/:id/public
async function getInstructorPublicProfile(req, res, next) {
  try {
    const instructor = await User.findOne({ _id: req.params.id, role: 'instructor' })
      .select('name bio headline website profileImage role createdAt');

    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor not found'
      });
    }

    const courses = await Course.find({ instructor: instructor._id, published: true })
      .populate('instructor', 'name profileImage')
      .select('title thumbnail price rating totalRatings totalStudents category');

    res.status(200).json({
      success: true,
      message: 'Instructor public profile retrieved successfully',
      data: { instructor, courses }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changeUserRole,
  getInstructorPublicProfile
};
