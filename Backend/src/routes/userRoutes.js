const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changeUserRole
} = require("../controllers/userController");
const { protect, adminMiddleware } = require("../middleware/auth");

// All user management routes are admin only
router.use(protect, adminMiddleware);

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);
router.patch("/:id/role", changeUserRole);

module.exports = router;
