const express = require("express");
const router = express.Router();
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist
} = require("../controllers/wishlistController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/", getWishlist);
router.get("/:courseId/check", checkWishlist);
router.post("/:courseId", addToWishlist);
router.delete("/:courseId", removeFromWishlist);

module.exports = router;
