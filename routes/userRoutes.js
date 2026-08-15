/* SnapSell Marketplace - User Routes
 *
 * Developers (Jakob Lalicon): [301498508]
 * 
 * Registration and login are open to anonymous visitors; everything else requires a valid JWT.*/

const express = require("express");

const {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile
} = require("../controllers/userControllers");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes - reachable without logging in

router.post("/register", registerUser);
router.post("/login", loginUser);

// Secure routes - the protect middleware rejects anonymous requests

router.post("/logout", protect, logoutUser);

router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

module.exports = router;